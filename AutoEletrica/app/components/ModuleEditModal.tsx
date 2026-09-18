"use client";

import { useEffect, useState } from "react";
import ConfirmModal from "./ConfirmModal";

type VideoItem = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail: string | null;
  duration: number;
  order: number;
  watched: boolean;
};

type ModuleData = {
  id: string;
  name: string;
  description: string | null;
  synopsis: string | null;
  pdfUrl: string | null;
  order: number;
  quiz?: { source: string; questionCount: number } | null;
};

type Props = {
  module: ModuleData;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
};

function videoServeUrl(url: string): string {
  const name = url.split("/").pop();
  return `/api/videos/serve/${name}`;
}

function formatDuration(sec: number): string {
  if (sec <= 0) return "---";
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

export default function ModuleEditModal({ module: mod, onClose, onSaved, onError }: Props) {
  const [tab, setTab] = useState<"edit" | "videos">("edit");
  const [name, setName] = useState(mod.name);
  const [desc, setDesc] = useState(mod.description ?? "");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingPdf, setDeletingPdf] = useState(false);
  const [confirmPdfDelete, setConfirmPdfDelete] = useState(false);
  const [confirmVideoDelete, setConfirmVideoDelete] = useState<string | null>(null);

  // Videos
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [videoOrder, setVideoOrder] = useState<VideoItem[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  // Upload video
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Delete video
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  // Edit video
  const [editVideo, setEditVideo] = useState<VideoItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [savingVideo, setSavingVideo] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, [mod.id]);

  function fetchVideos() {
    setLoadingVideos(true);
    fetch(`/api/videos?moduleId=${mod.id}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const list = d?.videos ?? [];
        setVideos(list);
        setVideoOrder(list);
      })
      .catch(() => {})
      .finally(() => setLoadingVideos(false));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("description", desc.trim());
      if (pdfFile) fd.append("file", pdfFile);
      const res = await fetch(`/api/modules/${mod.id}`, { method: "PATCH", body: fd });
      if (!res.ok) {
        const data = await res.json();
        onError(data.error || "Erro ao salvar");
        return;
      }
      onSaved();
    } catch {
      onError("Falha de conexão");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePdf() {
    setConfirmPdfDelete(false);
    setDeletingPdf(true);
    try {
      const res = await fetch(`/api/modules/${mod.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfUrl: null }),
      });
      if (!res.ok) {
        onError("Erro ao excluir PDF");
        return;
      }
      onSaved();
    } catch {
      onError("Falha de conexão");
    } finally {
      setDeletingPdf(false);
    }
  }

  async function handleUploadVideo() {
    if (!uploadFile || !uploadTitle.trim()) return;
    setUploading(true);
    try {
      let duration = 0;
      let thumbBlob: Blob | null = null;
      try {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = URL.createObjectURL(uploadFile);
        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => { duration = Math.floor(video.duration); video.currentTime = Math.min(1, video.duration * 0.1); resolve(); };
          video.onerror = () => resolve();
        });
        await new Promise<void>((resolve) => {
          video.onseeked = () => resolve();
          video.onerror = () => resolve();
          setTimeout(resolve, 3000);
        });
        if (video.videoWidth > 0) {
          const canvas = document.createElement("canvas");
          canvas.width = 320;
          canvas.height = Math.round((video.videoHeight / video.videoWidth) * 320);
          const ctx = canvas.getContext("2d");
          if (ctx) { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); thumbBlob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.7)); }
        }
        URL.revokeObjectURL(video.src);
      } catch {}

      const fd = new FormData();
      fd.append("moduleId", mod.id);
      fd.append("title", uploadTitle.trim());
      fd.append("description", uploadDesc.trim());
      fd.append("file", uploadFile);
      fd.append("duration", String(duration));
      if (thumbBlob) fd.append("thumbnail", thumbBlob, "thumb.jpg");
      const res = await fetch("/api/videos", { method: "POST", body: fd });
      if (!res.ok) { onError("Erro ao enviar vídeo"); return; }
      setUploadSuccess(true);
      fetchVideos();
      setTimeout(() => { setShowUpload(false); setUploadSuccess(false); setUploadTitle(""); setUploadDesc(""); setUploadFile(null); }, 1500);
    } catch { onError("Falha de conexão"); }
    finally { setUploading(false); }
  }

  async function handleDeleteVideo(id: string) {
    setConfirmVideoDelete(null);
    setDeletingVideoId(id);
    try {
      await fetch(`/api/videos/${id}`, { method: "DELETE" });
      fetchVideos();
    } catch { onError("Erro ao excluir vídeo"); }
    finally { setDeletingVideoId(null); }
  }

  async function handleSaveVideoEdit() {
    if (!editVideo) return;
    setSavingVideo(true);
    try {
      if (editFile) {
        let duration = editVideo.duration;
        let thumbBlob: Blob | null = null;
        try {
          const videoEl = document.createElement("video");
          videoEl.preload = "metadata";
          videoEl.muted = true;
          videoEl.src = URL.createObjectURL(editFile);
          await new Promise<void>((resolve) => {
            videoEl.onloadedmetadata = () => { duration = Math.floor(videoEl.duration); resolve(); };
            videoEl.onerror = () => resolve();
          });
          // Seek to 1 second
          videoEl.currentTime = Math.min(1, videoEl.duration * 0.1);
          await new Promise<void>((resolve) => {
            function onSeeked() { videoEl.removeEventListener("seeked", onSeeked); resolve(); }
            videoEl.addEventListener("seeked", onSeeked);
            setTimeout(resolve, 5000);
          });
          if (videoEl.videoWidth > 0) {
            const canvas = document.createElement("canvas");
            canvas.width = 320;
            canvas.height = Math.round((videoEl.videoHeight / videoEl.videoWidth) * 320);
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
              thumbBlob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.7));
            }
          }
          URL.revokeObjectURL(videoEl.src);
        } catch {}
        await fetch(`/api/videos/${editVideo.id}`, { method: "DELETE" });
        const fd = new FormData();
        fd.append("moduleId", mod.id);
        fd.append("title", editTitle.trim() || editVideo.title);
        fd.append("description", editDesc.trim());
        fd.append("file", editFile);
        fd.append("duration", String(duration));
        if (thumbBlob) fd.append("thumbnail", thumbBlob, "thumb.jpg");
        await fetch("/api/videos", { method: "POST", body: fd });
      } else {
        await fetch(`/api/videos/${editVideo.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: editTitle.trim(), description: editDesc.trim() }),
        });
      }
      setEditVideo(null);
      fetchVideos();
    } catch { onError("Erro ao salvar vídeo"); }
    finally { setSavingVideo(false); }
  }

  async function handleSaveOrder() {
    setSavingOrder(true);
    try {
      const order = videoOrder.map((v) => v.id);
      await fetch("/api/modules/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "videos", moduleId: mod.id, order }),
      });
      setReordering(false);
      fetchVideos();
    } catch { onError("Erro ao reordenar"); }
    finally { setSavingOrder(false); }
  }

  function moveVideo(idx: number, dir: -1 | 1) {
    const arr = [...videoOrder];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setVideoOrder(arr);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Editar módulo</h2>
          <button onClick={onClose} className="text-xl text-zinc-500 transition hover:text-white">✕</button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2">
          <button onClick={() => setTab("edit")} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "edit" ? "bg-amber-500/20 text-amber-400" : "text-zinc-400 hover:text-white"}`}>
            Editar
          </button>
          <button onClick={() => setTab("videos")} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "videos" ? "bg-violet-500/20 text-violet-400" : "text-zinc-400 hover:text-white"}`}>
            🎬 Vídeos ({videos.length})
          </button>
        </div>

        {/* Edit Tab */}
        {tab === "edit" && (
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div>
              <label className="block text-base font-semibold text-zinc-200">Nome do módulo</label>
              <input value={name} onChange={(e) => setName(e.target.value)} disabled={saving}
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-base font-semibold text-zinc-200">Descrição</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} disabled={saving}
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-base font-semibold text-zinc-200">Substituir PDF</label>
              <input type="file" accept=".pdf" disabled={saving} onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full cursor-pointer rounded-xl border border-dashed border-zinc-600 bg-zinc-950 px-4 py-3 text-base text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-amber-500 file:to-orange-600 file:px-4 file:py-2 file:text-base file:font-bold file:text-white hover:border-amber-500/50 disabled:opacity-50" />
            </div>
            {mod.pdfUrl && (
              <div className="flex items-center gap-3">
                <a href={mod.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-400 hover:underline">
                  📄 PDF atual
                </a>
                <button type="button" onClick={() => setConfirmPdfDelete(true)} disabled={deletingPdf}
                  className="rounded-lg border border-red-800/60 px-3 py-1 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50">
                  {deletingPdf ? "Excluindo..." : "🗑 Excluir PDF"}
                </button>
              </div>
            )}
            {saving ? (
              <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                <span className="h-6 w-6 shrink-0 animate-spin rounded-full border-[3px] border-amber-400 border-t-transparent" />
                <div>
                  <p className="text-base font-bold text-amber-300">
                    {pdfFile
                      ? "Enviando PDF, gerando quiz e conteúdo com IA..."
                      : "Salvando módulo..."}
                  </p>
                  <p className="mt-0.5 text-sm text-amber-200/70">
                    {pdfFile
                      ? "A IA está lendo o PDF para gerar o conteúdo e as perguntas. Pode levar até 1 minuto. Não feche esta página."
                      : "Aguarde enquanto o módulo é atualizado."}
                  </p>
                </div>
              </div>
            ) : (
              <button type="submit" disabled={!name.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-base font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50">
                Salvar alterações
              </button>
            )}
          </form>
        )}

        {/* Videos Tab */}
        {tab === "videos" && (
          <div className="mt-4">
            <p className="text-sm text-zinc-500">{videos.length} vídeo(s) neste módulo</p>
            <div className="mt-3 flex flex-col gap-2">
              {reordering ? (
                <>
                  <button onClick={handleSaveOrder} disabled={savingOrder}
                    className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                    {savingOrder ? "Salvando..." : "Salvar ordem"}
                  </button>
                  <button onClick={() => { setReordering(false); setVideoOrder(videos); }}
                    className="w-full rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setShowUpload(true); setUploadTitle(mod.name); setUploadDesc(""); setUploadFile(null); setUploadSuccess(false); }}
                    className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2.5 text-sm font-bold text-white">
                    + Adicionar vídeo
                  </button>
                  {videos.length > 1 && (
                    <button onClick={() => { setReordering(true); setVideoOrder([...videos]); }}
                      className="w-full rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5">
                      ↕ Reorganizar
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Video list */}
            <div className="mt-3 space-y-2">
              {loadingVideos ? (
                <p className="text-sm text-zinc-500">Carregando...</p>
              ) : videos.length === 0 ? (
                <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-center text-sm text-zinc-500">
                  Nenhum vídeo ainda. Clique em &quot;Adicionar vídeo&quot;.
                </p>
              ) : reordering ? (
                videoOrder.map((v, idx) => (
                  <div key={v.id} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-500/20 text-sm font-bold text-violet-400">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{v.title}</p>
                      <p className="text-xs text-zinc-500">{formatDuration(v.duration)}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => moveVideo(idx, -1)} disabled={idx === 0}
                        className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-30">↑</button>
                      <button onClick={() => moveVideo(idx, 1)} disabled={idx === videoOrder.length - 1}
                        className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-30">↓</button>
                    </div>
                  </div>
                ))
              ) : (
                videos.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                      {v.thumbnail ? (
                        <img src={videoServeUrl(v.thumbnail)} alt={v.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-lg text-zinc-600">▶</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{v.title}</p>
                      <p className="text-xs text-zinc-500">{formatDuration(v.duration)}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => { setEditVideo(v); setEditTitle(v.title); setEditDesc(v.description ?? ""); setEditFile(null); }}
                        className="rounded-lg border border-amber-600/50 px-3 py-1 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/10">
                        Editar
                      </button>
                      <button onClick={() => setConfirmVideoDelete(v.id)} disabled={deletingVideoId === v.id}
                            className="rounded-lg border border-red-800/60 px-3 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50">
                            {deletingVideoId === v.id ? "..." : "Excluir"}
                          </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Upload modal inside */}
            {showUpload && (
              <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4" onClick={() => { if (!uploading) { setShowUpload(false); setUploadSuccess(false); } }}>
                <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  {uploadSuccess ? (
                    <div className="flex items-center gap-3 py-4"><span className="text-2xl">✓</span><p className="text-base font-bold text-emerald-400">Vídeo enviado!</p></div>
                  ) : uploading ? (
                    <div className="flex flex-col items-center gap-4 py-8">
                      <span className="h-10 w-10 animate-spin rounded-full border-4 border-violet-400 border-t-transparent" />
                      <p className="text-base font-bold text-violet-300">Enviando vídeo...</p>
                      <p className="text-sm text-zinc-500">Isso pode levar um momento</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Adicionar vídeo</h3>
                        <button onClick={() => { setShowUpload(false); setUploadSuccess(false); }}
                          className="text-xl text-zinc-500 transition hover:text-white">✕</button>
                      </div>
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-zinc-200">Título</label>
                          <input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-white outline-none focus:border-violet-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-zinc-200">Descrição</label>
                          <textarea value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} rows={2} placeholder="Opcional"
                            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-white outline-none focus:border-violet-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-zinc-200">Arquivo (MP4, WebM)</label>
                          <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime"
                            onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                            className="mt-1 block w-full cursor-pointer rounded-xl border border-dashed border-zinc-600 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-violet-500 file:to-purple-600 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-white hover:border-violet-500/50" />
                        </div>
                        <button onClick={handleUploadVideo} disabled={!uploadTitle.trim() || !uploadFile}
                          className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                          Enviar vídeo
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {confirmPdfDelete && (
        <ConfirmModal
          title="Excluir PDF"
          message="Tem certeza que deseja excluir o PDF deste módulo? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          danger
          onConfirm={handleDeletePdf}
          onCancel={() => setConfirmPdfDelete(false)}
        />
      )}

      {confirmVideoDelete && (
        <ConfirmModal
          title="Excluir vídeo"
          message="Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          danger
          onConfirm={() => handleDeleteVideo(confirmVideoDelete)}
          onCancel={() => setConfirmVideoDelete(null)}
        />
      )}

      {editVideo && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => { if (!savingVideo) setEditVideo(null); }}>
          <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Editar vídeo</h3>
              <button onClick={() => setEditVideo(null)} disabled={savingVideo}
                className="text-xl text-zinc-500 transition hover:text-white">✕</button>
            </div>
            <div className="mt-2 text-sm text-zinc-400">
              {formatDuration(editVideo.duration)}
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-200">Título</label>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} disabled={savingVideo}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-200">Descrição</label>
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} disabled={savingVideo}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-200">Substituir vídeo (opcional)</label>
                <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" disabled={savingVideo}
                  onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                  className="mt-1 block w-full cursor-pointer rounded-xl border border-dashed border-zinc-600 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-violet-500 file:to-purple-600 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-white hover:border-violet-500/50 disabled:opacity-50" />
                {editFile && <p className="mt-1 text-xs text-emerald-400">Novo arquivo selecionado</p>}
              </div>
              {savingVideo ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <span className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
                  <p className="text-sm font-bold text-amber-300">Salvando alterações...</p>
                </div>
              ) : (
                <button onClick={handleSaveVideoEdit} disabled={!editTitle.trim()}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50">
                  Salvar alterações
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

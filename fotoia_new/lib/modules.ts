export interface SubModule {
  title: string;
  content: string;
  images: string[];
}

export interface Module {
  id: number;
  num: string;
  title: string;
  icon: string;
  tag: string;
  summary: string;
  submodules: SubModule[];
}

export const MODULES: Module[] = [
  {
    id: 1,
    num: "01",
    title: "Introducao à Fotografia com IA",
    icon: "📸",
    tag: "Fundamentos",
    summary:
      "O que e fotografia generativa, como a IA interpreta comandos de texto e por que prompts sao a nova ferramenta essencial para criar imagens incriveis.",
    submodules: [
      {
        title: "O que e Fotografia com IA?",
        content:
          "A fotografia com Inteligencia Artificial e um novo paradigma criativo onde imagens sao geradas a partir de descricoes textuais, conhecidas como prompts.\nDiferente da fotografia tradicional que depende de camera, cenario e momento, a IA permite criar qualquer cena imaginavel com precisao tecnica impressionante.\nPlataformas como Midjourney, DALL-E e Stable Diffusion transformam palavras em imagens fotorrealisticas, artisticas ou estilizadas.\nEste curso ensina a dominar essas ferramentas para criar imagens profissionais usando apenas sua criatividade e prompts bem elaborados.",
        images: [],
      },
      {
        title: "Como a IA Interpreta Prompts",
        content:
          "Prompts sao instrucoes textuais que a IA usa como base para gerar imagens. Quanto mais detalhada a descricao, mais precisa sera o resultado.\nA IA analisa cada palavra-chave: sujeito, estilo, iluminacao, composicao, cores, atmosfera e muito mais.\nTermos tecnicos de fotografia como golden hour, bokeh, wide angle e cinematic lighting sao interpretados diretamente pelos modelos de IA.\nEntender como a IA processa sua linguagem e o primeiro passo para dominar a arte dos prompts.",
        images: [],
      },
      {
        title: "Diferenca entre IA Generativa e Edicao por IA",
        content:
          "IA generativa cria imagens completamente novas a partir do zero, baseando-se apenas no prompt fornecido.\nEdicao por IA modifica imagens existentes, aplicando filtros, mudancas de estilo ou ajustes especificos.\nFerramentas como o Photoshop com IA generativa permitem expandir quadros, remover objetos e adicionar elementos de forma inteligente.\nDominar ambas as abordagens e essencial para um workflow completo de criacao fotografica com IA.",
        images: [],
      },
    ],
  },
  {
    id: 2,
    num: "02",
    title: "Conceitos Fundamentais de Fotografia",
    icon: "🎯",
    tag: "Teoria",
    summary:
      "Composicao, regra dos tercos, iluminacao, profundidade de campo e outros principios que tornam sua IA mais criativa e suas imagens mais impactantes.",
    submodules: [
      {
        title: "Composicao e Regra dos Tercoes",
        content:
          "A composicao e a disposicao dos elementos na imagem para guiar o olhar do espectador.\nA regra dos tercos divide a imagem em 9 partes iguais usando duas linhas horizontais e duas verticais; posicionar sujeitos nas intersecoes cria equilibrio visual.\nOutras tecnicas incluem simetria, triangulos, linhas guia e espacos negativos que dao respiracao a composicao.\nNo prompt, voce pode instruir a IA a seguir essas regras com termos como rule of thirds composition, centered subject ou leading lines.",
        images: [],
      },
      {
        title: "Iluminacao Natural e Artificial",
        content:
          "A iluminacao define o humor e a profundidade de uma fotografia. A luz dourada do golden hour cria atmosferas quentes e acolhedoras.\nLuz dura produz sombras definidas e alto contraste; luz suave, como em dias nublados, suaviza sombras e revela detalhes.\nBacklighting (contra-luz) cria silhuetas dramaticas; side lighting (luz lateral) revela texturas e formas.\nAo descrever iluminacao no prompt, use termos como soft studio lighting, dramatic side light, golden hour sunlight, neon glow ou volumetric light.",
        images: [],
      },
      {
        title: "Profundidade de Campo e Bokeh",
        content:
          "A profundidade de campo (DoF) controla o quanto da imagem esta em foco. DoF rasa mantem o sujeito nitido e desfoca o fundo, criando o efeito bokeh.\nPara prompts com DoF rasa, use shallow depth of field, f/1.4, blurry background, bokeh effect.\nPara imagens onde tudo esta nitido, como paisagens, use deep depth of field, f/11, everything in focus.\nA IA interpreta esses parametros para simular a fisica de lentes reais, criando resultados muito proximos aos de cameras profissionais.",
        images: [],
      },
      {
        title: "Perspectiva e Angulos de Camera",
        content:
          "A perspectiva muda completamente a leitura de uma imagem. Angulo baixo (low angle) torna o sujeito imponente; angulo alto (high angle) mostra vulnerabilidade.\nPonto de vista de cima (birds eye view) mostra padroes e contextos; perspectiva de olho (eye level) e neutra e natural.\nDutch angle (angulo inclinado) cria tensao e dinamismo; worms eye view (angulo de baixo extremo) da escala monumental.\nNo prompt, especifique: shot from below, aerial view, eye level portrait, dutch angle ou first person perspective.",
        images: [],
      },
    ],
  },
  {
    id: 3,
    num: "03",
    title: "Estrutura de um Prompt Perfeito",
    icon: "✍️",
    tag: "Prompts",
    summary:
      "A formula para construir prompts eficazes: sujeito, estilo, iluminacao, composicao, atmosfera e parametros tecnicos que a IA interpreta.",
    submodules: [
      {
        title: "A Formula Base do Prompt",
        content:
          "Um prompt eficaz segue uma estrutura logica: [Sujeito] + [Estilo] + [Iluminacao] + [Composicao] + [Atmosfera] + [Parametros Tecnicos].\nExemplo: Uma mulher jovem, fotografia retrato, luz suave de golden hour, composicao central, atmosfera cinematografica, 8K, f/2.8.\nCada camada adiciona informacao que a IA usa para refinar o resultado. Quanto mais especifico, menor a chance de surpresas indesejadas.\nComece simples e va adicionando camadas conforme necessario.",
        images: [],
      },
      {
        title: "Palavras-Chave Essenciais",
        content:
          "Termos como photorealistic, hyperdetailed, RAW photo, professional photography indicam a IA que voce busca fotorrealismo.\nOil painting, watercolor, sketch direcionam para arte tradicional; cinematic, film grain, anamorphic criam estetica de cinema.\nStudio lighting, Rembrandt lighting, neon lighting, volumetric light definem a iluminacao com precisao.\nEstas palavras-chave sao o vocabulario que conecta sua visao criativa ao motor de geracao da IA.",
        images: [],
      },
      {
        title: "Parametros Tecnicos nos Prompts",
        content:
          "Alem das descricoes, muitos modelos aceitam parametros tecnicos que afetam diretamente o resultado.\nEm Midjourney: --ar 16:9 (proporcao), --style raw (menos estilizado), --stylize 600 (mais artistico), --chaos 30 (variacao).\nEm Stable Diffusion: steps (qualidade), CFG scale (aderencia ao prompt), sampler (metodo de geracao), seed (reprodutibilidade).\nDominar esses parametros permite controle fino sobre a saida da IA.",
        images: [],
      },
    ],
  },
  {
    id: 4,
    num: "04",
    title: "Midjourney na Pratica",
    icon: "🖼️",
    tag: "Ferramenta",
    summary:
      "Como usar o Midjourney para criar imagens de altissima qualidade, com comandos, parametros e dicas para resultados profissionais.",
    submodules: [
      {
        title: "Configuracao e Primeiros Passos",
        content:
          "O Midjourney e acessado via Discord, onde voce interage com o bot usando comandos como /imagine.\nApos assinar o plano, crie um servidor privado para organizar seus trabalhos e evitar ruido dos canais publicos.\nUse /settings para definir padroes: modelo (v6, v6.1), qualidade (--q), estilo e proporcao padrao.\nComece com prompts simples e observe como o Midjourney interpreta suas palavras antes de avancar para complexidade.",
        images: [],
      },
      {
        title: "Comandos Essenciais",
        content:
          "/imagine [prompt] gera a imagem; /describe [imagem] sugere prompts para uma foto existente; /blend [imagens] combina duas ou mais imagens.\nBotoes abaixo da geracao: U1-U4 (aumentar), V1-V4 (variacoes), repetir.\n--ar [proporcao] define largura x altura; --no [elemento] exclui algo especifico; --seed [numero] mantem consistencia.\n--stylize [0-1000] controla quanto a IA interpreta artisticamente; --chaos [0-100] adiciona variacao entre os 4 resultados.",
        images: [],
      },
      {
        title: "Dicas para Resultados Profissionais",
        content:
          "Use referencias de estilo: in the style of Annie Leibovitz ou National Geographic photography direcionam a estetica.\nPara fotorrealismo extremo, combine: RAW photo, 8K, ultra-detailed, professional photography, shot on Canon EOS R5.\nUse --style raw para reduzir a pintura do Midjourney e obter resultados mais proximos de fotos reais.\nItere: gere variacoes (V) dos melhores resultados e refine o prompt baseado no que funcionou.",
        images: [],
      },
    ],
  },
  {
    id: 5,
    num: "05",
    title: "DALL-E e Stable Diffusion",
    icon: "🤖",
    tag: "Ferramenta",
    summary:
      "As alternativas poderosas ao Midjourney: DALL-E 3 do OpenAI e o open-source Stable Diffusion com suas vantagens unicas.",
    submodules: [
      {
        title: "DALL-E 3: Integracao com ChatGPT",
        content:
          "O DALL-E 3 esta integrado ao ChatGPT Plus, permitindo conversas iterativas para refinar imagens.\nBasta descrever o que deseja em linguagem natural; o ChatGPT interpreta e gera a imagem diretamente na conversa.\nIdeal para quem ja usa ChatGPT e quer um fluxo de trabalho fluido, sem precisar de Discord ou interfaces separadas.\nAceita prompts detalhados e e excelente para conceitos abstratos e ilustracoes estilizadas.",
        images: [],
      },
      {
        title: "Stable Diffusion: O Poder do Open Source",
        content:
          "O Stable Diffusion e gratuito e roda localmente, dando controle total sobre o processo de geracao.\nInterfaces como Automatic1111, ComfyUI e InvokeAI oferecem fluxos de trabalho avancados com nodes e pipelines.\nSuporta LoRAs (adaptacoes de estilo), ControlNet (controle preciso de pose e composicao) e checkpoints personalizados.\nPara rodar localmente, voce precisa de uma GPU com pelo menos 8GB de VRAM (NVIDIA recomendado).",
        images: [],
      },
      {
        title: "ControlNet: Controle Total sobre a Geracao",
        content:
          "O ControlNet permite guiar a IA usando imagens de referencia para pose, bordas, profundidade e mais.\nDepth maps (mapas de profundidade) mantem a mesma estrutura tridimensional da cena original.\nCanny edges (bordas) preservam contornos enquanto alteram estilo e conteudo.\nOpenPose transfere poses especificas para personagens gerados, ideal para composicoes precisas.",
        images: [],
      },
    ],
  },
  {
    id: 6,
    num: "06",
    title: "Prompt Engineering Avancado",
    icon: "🧪",
    tag: "Avancado",
    summary:
      "Tecnicas avancadas como weighting, negative prompts, prompt blending e multipart prompting para controle maximo sobre a IA.",
    submodules: [
      {
        title: "Weighting (Ponderacao) de Palavras",
        content:
          "Em Stable Diffusion, use parenteses e numeros para dar peso a termos: (word:1.3) aumenta a importancia em 30%.\n(word:0.7) reduz a influencia do termo; multiplos parenteses ((word)) tambem aumentam o peso gradualmente.\nNo Midjourney, use :: para separar conceitos com pesos diferentes: portrait::2 sunset::1.\nIsso permite balancear elementos conflitantes no prompt, priorizando o que e mais importante para sua visao.",
        images: [],
      },
      {
        title: "Negative Prompts: O Que Nao Quer",
        content:
          "O negative prompt lista elementos que a IA deve evitar: ugly, blurry, low quality, deformed hands, extra fingers.\nPrompts negativos sao especialmente importantes para retratos, onde a IA frequentemente gera maos e dentes defeituosos.\nListas negativas comuns: text, watermark, logo, signature, cropped, out of frame, worst quality.\nEm ferramentas avancadas, voce pode ter negativos diferentes para cada area da imagem usando inpainting.",
        images: [],
      },
      {
        title: "Prompt Blending e Multi-Step",
        content:
          "Prompt blending combina dois ou mais prompts para criar algo unico: cyberpunk city:: neon lights:: rain:: 0.5::0.3.\nMulti-step prompting usa o resultado de uma geracao como input para a proxima, construindo complexidade gradualmente.\nInpainting permite gerar apenas uma parte da imagem, mantendo o restante intacto.\nOutpainting expande a imagem alem de suas bordas originais, preenchendo o novo espaco com continuidade.",
        images: [],
      },
    ],
  },
  {
    id: 7,
    num: "07",
    title: "Estilos Fotograficos com IA",
    icon: "🎨",
    tag: "Estilo",
    summary:
      "Como reproduzir e criar estilos visuais: retrato, paisagem, moda, street photography, fotografia noturna e muito mais.",
    submodules: [
      {
        title: "Retrato e Beleza",
        content:
          "Para retratos fotorrealistas, use: portrait photography, beautiful woman, natural skin, detailed eyes, soft studio lighting, 8K, f/1.8, bokeh background.\nPara efeito de moda: high fashion editorial, dramatic lighting, Vogue style, professional retouching, sharp details.\nRetratos artisticos: double exposure portrait, ethereal, dreamy atmosphere, soft focus, pastel colors.\nSempre especifique: expressao facial, direcao do olhar, profundidade de campo e tipo de iluminacao.",
        images: [],
      },
      {
        title: "Paisagem e Natureza",
        content:
          "Paisagens epicas: breathtaking landscape, golden hour, dramatic clouds, vibrant colors, ultra-wide angle, 16K, National Geographic style.\nPaisagens minimalistas: minimalist landscape, fog, single tree, muted colors, zen atmosphere, negative space.\nMacro natureza: macro photography, dewdrop on leaf, extreme detail, shallow depth of field, 100mm macro lens.\nAdicione elementos de clima: morning mist, autumn leaves, snow-covered, thunderstorm clouds.",
        images: [],
      },
      {
        title: "Urbano e Street Photography",
        content:
          "Street photography: candid street photo, urban life, neon signs, rain-soaked streets, cinematic color grading, Leica M10.\nArquitetura: modern architecture, geometric patterns, leading lines, dramatic shadows, minimalist composition.\nCenas noturnas urbanas: night cityscape, long exposure, light trails, bokeh lights, cyberpunk atmosphere.\nAdicione contexto temporal e emocional: nostalgic, energetic, solitary, bustling.",
        images: [],
      },
    ],
  },
  {
    id: 8,
    num: "08",
    title: "Iluminacao e Cor com IA",
    icon: "💡",
    tag: "Tecnico",
    summary:
      "Domine a linguagem da luz: tipos de iluminacao, paletas de cores, temperatura de cor e atmosfera visual nos prompts.",
    submodules: [
      {
        title: "Tipos de Iluminacao em Prompts",
        content:
          "Rembrandt lighting: triangle of light on cheek, dramatic and classical; use Rembrandt lighting, dramatic, painterly.\nButterfly lighting: shadow under nose, glamorous and flattering; butterfly lighting, beauty shot, Hollywood glamour.\nSplit lighting: half face lit, half shadow; split lighting, dramatic, mysterious, noir.\nBroad vs short lighting: broad ilumina o lado mais proximo; short ilumina o lado mais distante, afinando o rosto.",
        images: [],
      },
      {
        title: "Temperatura de Cor e Paletas",
        content:
          "Warm tones (tons quentes): golden, amber, orange transmitem acolhimento e nostalgia; use warm color palette, golden tones.\nCool tones (tons frios): blue, cyan, violet transmitem calma e modernidade; cool tones, blue hour, icy atmosphere.\nComplementary colors: pares opostos no circulo cromatico criam contraste vibrante; teal and orange color grading.\nMonochromatic: tons de uma unica cor; monochromatic blue, cinematic color palette.\nPastel: cores suaves e desaturadas; pastel colors, soft palette, dreamy aesthetic.",
        images: [],
      },
      {
        title: "Atmosfera e Humor Visual",
        content:
          "A atmosfera e o sentimento que a imagem transmite. Use adjetivos emocionais no prompt: ethereal, moody, vibrant, serene.\nElementos ambientais criam atmosfera: fog, rain, sun rays through clouds, dust particles in light.\nCores e contrastes influenciam o humor: alto contraste = drama; baixo contraste = suavidade.\nCombine iluminacao + cor + elementos para construir uma atmosfera coerente em cada prompt.",
        images: [],
      },
    ],
  },
  {
    id: 9,
    num: "09",
    title: "Edicao de Fotos com IA",
    icon: "🖌️",
    tag: "Edicao",
    summary:
      "Remove backgrounds, substitui objetos, expande cenas e aplica estilos com ferramentas de edicao inteligente.",
    submodules: [
      {
        title: "Remocao e Substituicao de Fundo",
        content:
          "Remover fundo: tools como remove.bg ou Photoshop Remove Background usam IA para detectar sujeitos automaticamente.\nSubstituir fundo com IA generativa: selecione o fundo e descreva o novo cenario; a IA integra naturalmente.\nRefine edges: ferramentas de refinamento de borda tratam cabelos e transparencias com precisao.\nPara prompts que geram fundos perfeitos, especifique: isolated on white background, studio backdrop, transparent background.",
        images: [],
      },
      {
        title: "Inpainting e Outpainting",
        content:
          "Inpainting: selecione uma area da imagem e descreva o que deve ocupar aquele espaco; a IA gera com coerencia visual.\nUtil para: remover pessoas indesejadas, adicionar elementos, corrigir defeitos, trocar roupas ou expressoes.\nOutpainting: expande a imagem alem de suas bordas, mantendo estilo e continuidade.\nAdobe Firefly e Photoshop Generative Fill sao referencias em ferramentas de inpainting profissional.",
        images: [],
      },
      {
        title: "Super-Resolucao e Enhance",
        content:
          "Upscaling com IA: ferramentas como Topaz Gigapixel AI e Real-ESRGAN aumentam resolucao mantendo detalhes.\nDenosing: remove ruido de imagens escuras ou de baixa qualidade sem perder nitidez.\nSharpening: IA inteligente que melhora nitidez em areas especificas, nao globalmente.\nEssas ferramentas sao essenciais para transformar geracoes da IA em materiais de alta resolucao para impressao ou uso profissional.",
        images: [],
      },
    ],
  },
  {
    id: 10,
    num: "10",
    title: "Fotografia para Redes Sociais",
    icon: "📱",
    tag: "Social",
    summary:
      "Crie conteudo visual impactante para Instagram, TikTok e LinkedIn com prompts otimizados para cada plataforma.",
    submodules: [
      {
        title: "Conteudo para Instagram",
        content:
          "Stories e Reels: prompts verticais com 9:16 aspect ratio, mobile-first composition, bold colors, text-friendly space.\nFeed: imagens consistentes com paleta de cores definida; Instagram aesthetic, cohesive feed, brand colors.\nCarousel: series visuais com narrativa; pense em 3-5 imagens que contam uma historia.\nHashtags visuais: trending aesthetic, minimalist lifestyle, dark academia, cottagecore.",
        images: [],
      },
      {
        title: "Thumbnails e Capas",
        content:
          "YouTube thumbnails: bright, high contrast, expressive face, bold text space, 16:9, eye-catching.\nPodcast covers: square format, centered subject, clean design, podcast artwork, modern typography.\nBlog headers: wide format, editorial photography, clean composition, text overlay space.\nLembre-se: thumbnails funcionam em tamanhos pequenos; use cores contrastantes e rostos expressivos.",
        images: [],
      },
      {
        title: "Branding Visual com IA",
        content:
          "Crie uma paleta de marca consistente: defina 3-5 cores e use sempre nos prompts.\nDesenvolva um estilo fotografico reconocivel: mesma iluminacao, mesma proporcao, mesmo tratamento de cor.\nUse IA para gerar variacoes do mesmo conceito mantendo coerencia visual.\nFerramentas como Midjourney permitem criar style references para manter consistencia entre geracoes.",
        images: [],
      },
    ],
  },
  {
    id: 11,
    num: "11",
    title: "Design e Criatividade com IA",
    icon: "🎭",
    tag: "Criativo",
    summary:
      "Saida do fotorrealismo: ilustracoes, conceitos abstratos, design grafico e exploracao criativa com IA generativa.",
    submodules: [
      {
        title: "Ilustracao e Arte Digital",
        content:
          "Ilustracao: digital illustration, vibrant colors, clean lines, character design, concept art.\nArte tradicional simulada: oil painting, canvas texture, visible brushstrokes, classical art style.\nPixel art: pixel art, 16-bit, retro gaming aesthetic, sprite design.\nFlat design: flat illustration, vector style, modern UI design, clean shapes.\nCada estilo tem suas palavras-chave especificas que a IA interpreta fielmente.",
        images: [],
      },
      {
        title: "Conceitos Abstratos e Emocionais",
        content:
          "Transforme emocoes em imagens: loneliness pode gerar uma pessoa solitaria em praca vazia ao entardecer.\nUse metaforas visuais: tempo como relogios derretendo, liberdade como passaros em voo.\nConceitos abstratos: confusion com cores caoticas e formas sobrepostas; paz com linhas suaves e tons pastel.\nCombine uma emocao com um estilo para resultados unicos: joy as watercolor splash, vibrant and organic.",
        images: [],
      },
      {
        title: "Design de Produtos e Mockups",
        content:
          "Mockups de produto: product photography, clean white background, professional lighting, e-commerce style.\nPackaging design: packaging mockup, modern design, eco-friendly materials, shelf display.\nSocial media graphics: modern social media template, brand colors, clean typography space.\nUse IA para prototipagem rapida de conceitos visuais antes de investir em producao final.",
        images: [],
      },
    ],
  },
  {
    id: 12,
    num: "12",
    title: "Workflow Completo e Casos de Estudo",
    icon: "🚀",
    tag: "Pratico",
    summary:
      "Do conceito a entrega final: fluxos de trabalho profissionais, estudos de caso e boas praticas para photographer com IA.",
    submodules: [
      {
        title: "Fluxo de Trabalho Profissional",
        content:
          "Fase 1: Briefing defina objetivos, publico, estilo e restricoes do projeto.\nFase 2: Exploracao gere dezenas de variacoes, explore estilos e composicoes diferentes.\nFase 3: Selecao escolha os melhores resultados com base nos criterios do briefing.\nFase 4: Refinamento use inpainting, outpainting e upscale para polir os resultados.\nFase 5: Entrega formate para o canal de distribuicao (web, impressao, redes sociais).",
        images: [],
      },
      {
        title: "Estudos de Caso Reais",
        content:
          "Caso 1: Campanha de moda prompts para looks de estacao, consistencia visual, direcao de arte com IA.\nCaso 2: Material educativo infograficos, imagens ilustrativas para blog e redes sociais.\nCaso 3: Arte para NFTs criacao de series coerentes com estilo unico reconhecivel.\nCaso 4: Prototipagem de produto mockups realistas para apresentacao a investidores.\nCada caso demonstra o fluxo completo do prompt a entrega.",
        images: [],
      },
      {
        title: "Boas Praticas e Etica",
        content:
          "Respeite direitos autorais: nao copie estilos de artistas vivos sem permissao.\nSeja transparente: quando usar imagens geradas por IA, informe o publico.\nConsidere o impacto ambiental: modelos de IA consomem energia significativa.\nMantenha humanidade no processo: IA e uma ferramenta, nao substitui criatividade humana.\nAcompanhe evolucao: novos modelos e ferramentas surgem constantemente; mantenha-se atualizado.",
        images: [],
      },
    ],
  },
];

export function moduleTitle(id: number): string {
  return MODULES.find((m) => m.id === id)?.title ?? `Modulo ${id}`;
}

const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const p = new PrismaClient();

const modules = [
  { id: 'bfc6f99c-d95c-4fff-ba29-b994d94ee069', order: 1, name: 'Introducao a Fotografia com IA' },
  { id: '90342e19-aea5-4d3e-80bf-8e1e11680e78', order: 2, name: 'Conceitos Fundamentais de Fotografia' },
  { id: 'd23fa09a-61f1-4396-9824-9875cf75b746', order: 3, name: 'Estrutura de um Prompt Perfeito' },
  { id: '10f62ec7-66cd-4dc4-b5d4-f1d7e41453b1', order: 4, name: 'Midjourney na Pratica' },
  { id: '82a8fbb5-b642-4142-b2ba-5b3cd858bee0', order: 5, name: 'DALL-E e Stable Diffusion' },
  { id: 'd8cad74c-b84d-4612-9dde-5e4cc79e0c33', order: 6, name: 'Prompt Engineering Avancado' },
  { id: 'c1378522-60a6-485c-b69e-1f276bf60b01', order: 7, name: 'Estilos Fotograficos com IA' },
  { id: '3285a185-650c-4f3b-b5ef-14ca9dd8be52', order: 8, name: 'Iluminacao e Cor com IA' },
  { id: '295b41fc-41da-41f9-bd89-eab97cfdaa30', order: 9, name: 'Edicao de Fotos com IA' },
  { id: 'e93af156-618a-44f0-9f76-47d123b277bd', order: 10, name: 'Fotografia para Redes Sociais' },
  { id: '91a51988-7bf6-4a15-b363-8d379fafc6d8', order: 11, name: 'Design e Criatividade com IA' },
  { id: '17a67469-9dab-4180-9246-32d03c27f6e3', order: 12, name: 'Workflow Completo e Casos de Estudo' },
];

const allQuestions = {
  1: [
    { q: 'O que e um prompt na geração de imagens com IA?', o: ['Uma senha de acesso', 'Uma descrição textual que guia a geração', 'Um tipo de câmera', 'Um filtro de imagem'], c: 1 },
    { q: 'Qual a principal ferramenta para geração de imagens com IA?', o: ['Photoshop', 'Midjourney', 'Excel', 'Word'], c: 1 },
    { q: 'O que a IA faz com um prompt?', o: ['Traduz para outro idioma', 'Gera uma imagem baseada na descrição', 'Altera o brilho da foto', 'Envia por email'], c: 1 },
    { q: 'Qual modelo da OpenAI gera imagens?', o: ['GPT-4', 'DALL-E', 'Whisper', 'Codex'], c: 1 },
    { q: 'Para que serve o parâmetro --ar no Midjourney?', o: ['Arquivo', 'Aspect ratio (proporção)', 'Arte', 'Arrow'], c: 1 },
    { q: 'O que e Stable Diffusion?', o: ['Uma câmera', 'Um modelo open-source de geração', 'Uma rede social', 'Um editor de vídeo'], c: 1 },
    { q: 'Como descrever o estilo de uma imagem no prompt?', o: ['Usando números', 'Com adjetivos e referências visuais', 'Só com cores', 'Com emojis'], c: 1 },
    { q: 'Qual a importância das referências visuais?', o: ['Não tem importância', 'Ajudam a guiar o estilo e composição', 'Só servem para copiar', 'São proibidas'], c: 1 },
    { q: 'O que é um negative prompt?', o: ['Algo proibido', 'Palavras que devem ser evitadas na geração', 'Um prompt invertido', 'Um erro comum'], c: 1 },
    { q: 'Qual ética ao usar IA na fotografia?', o: ['Não existe', 'Transparência sobre uso de IA', 'Sempre esconder', 'Pode copiar qualquer coisa'], c: 1 },
  ],
  2: [
    { q: 'O que é a exposição em fotografia?', o: ['Velocidade do obturador', 'Quantidade de luz que atinge o sensor', 'Tamanho da lente', 'Tipo de câmera'], c: 1 },
    { q: 'O que controla a abertura (f/stop)?', o: ['ISO', 'Velocidade', 'Quantidade de luz e profundidade de campo', 'Cor da imagem'], c: 2 },
    { q: 'O que é profundidade de campo?', o: ['Resolução da imagem', 'Zona da imagem em foco', 'Velocidade do obturador', 'Temperatura de cor'], c: 1 },
    { q: 'O que é a regra dos terços?', o: ['Dividir a imagem em 9 partes', 'Usar 3 cores', 'Tirar 3 fotos', '3 segundos de exposição'], c: 0 },
    { q: 'Qual a relação entre ISO e ruído?', o: ['ISO alto = menos ruído', 'ISO alto = mais ruído', 'Não há relação', 'ISO só afeta cor'], c: 1 },
    { q: 'O que é balanço de branco?', o: ['Cor da lente', 'Ajuste de temperatura de cor', 'Tipo de sensor', 'Modo de foco'], c: 1 },
    { q: 'Qual a diferença entre RAW e JPEG?', o: ['RAW é compactado mais', 'RAW guarda mais dados brutos do sensor', 'JPEG é melhor', 'Não há diferença'], c: 1 },
    { q: 'O que é composição negativa?', o: ['Espaço vazio ao redor do sujeito', 'Uma foto com defeito', 'Cor invertida', 'Contraste alto'], c: 0 },
    { q: 'Qual iluminação é melhor para retratos?', o: ['Flash direto', 'Luz natural difusa ou rembrandt', 'Luz de neônio', 'Sem iluminação'], c: 1 },
    { q: 'O que é o triângulo de exposição?', o: ['ISO, abertura e velocidade', 'Foco, zoom e flash', 'Cor, brilho e contraste', 'Composição, enquadramento e perspectiva'], c: 0 },
  ],
  3: [
    { q: 'Quais elementos compõem um prompt?', o: ['Sujeito, estilo, ambiente e parâmetros', 'Só o nome do objeto', 'Apenas cores', 'Tamanho em pixels'], c: 0 },
    { q: 'O que significa ser específico nos prompts?', o: ['Usar palavras vagas', 'Detalhar o que se quer ver na imagem', 'Escrever muito texto', 'Copiar de outros'], c: 1 },
    { q: 'Como especificar estilo artístico?', o: ['Comando especial', 'Mencionar estilo desejado (ex: oil painting)', 'Não é possível', 'Só com filtros'], c: 1 },
    { q: 'Para que servem adjetivos nos prompts?', o: ['Encher texto', 'Detalhar qualidades visuais', 'São ignorados', 'Apenas decorativos'], c: 1 },
    { q: 'O que é prompt weighting?', o: ['Peso da lente', 'Dar mais ou menos importância a termos', 'Peso da imagem', 'Tamanho do prompt'], c: 1 },
    { q: 'Por que descrever o ambiente no prompt?', o: ['Não é necessário', 'Define cenário e atmosfera', 'Apenas para preencher', 'Só em retratos'], c: 1 },
    { q: 'Como controlar composição via prompt?', o: ['Comando secreto', 'Descrever posicionamento e enquadramento', 'Não é possível', 'Só na edição'], c: 1 },
    { q: 'O que é negative prompt?', o: ['Prompt proibido', 'Termos para excluir da geração', 'Prompt invertido', 'Erro de digitação'], c: 1 },
    { q: 'Qual a importância da ordem das palavras?', o: ['Não importa', 'Palavras antes têm mais peso', 'Só a primeira importa', 'Todas iguais'], c: 1 },
    { q: 'Como combinar múltiplos conceitos?', o: ['Prompt único bem estruturado', 'Vários prompts separados', 'Não é possível', 'Só com IA específica'], c: 0 },
  ],
  4: [
    { q: 'Como iniciar imagens no Midjourney?', o: ['Comando /imagine', 'Comando /create', 'Comando /image', 'Comando /start'], c: 0 },
    { q: 'O que significa --v?', o: ['Versão do modelo', 'Volume', 'Visual', 'Vetor'], c: 0 },
    { q: 'Qual comando gera variações?', o: ['U1-U4', 'V1-V4', 'R1-R4', 'C1-C4'], c: 0 },
    { q: 'O que faz --s (stylize)?', o: ['Salva a imagem', 'Controla quanto a IA estiliza', 'Define o estilo', 'Scroll'], c: 1 },
    { q: 'Como definir proporção no Midjourney?', o: ['--ar 16:9', '--size 16:9', '--ratio 16:9', '--format 16:9'], c: 0 },
    { q: 'O que é o modo Remix?', o: ['Misturar imagens', 'Editar prompt entre variações', 'Adicionar música', 'Remover fundo'], c: 1 },
    { q: 'Diferença entre /imagine e /describe?', o: ['Imagem→texto vs texto→imagem', 'São iguais', '/describe é premium', '/imagine é novo'], c: 0 },
    { q: 'Como usar imagens de referência?', o: ['Cole a URL no prompt', 'Comando --ar', 'Não é possível', 'Só em premium'], c: 0 },
    { q: 'O que é seed no Midjourney?', o: ['Semente geneticamente modificada', 'Número que controla aleatoriedade', 'Tipo de lente', 'Modo secreto'], c: 1 },
    { q: 'Qual plano permite uso comercial?', o: ['Basic', 'Standard ou superior', 'Gratuito', 'Não existe'], c: 1 },
  ],
  5: [
    { q: 'Qual empresa criou o DALL-E?', o: ['Google', 'Meta', 'OpenAI', 'Adobe'], c: 2 },
    { q: 'O que é Stable Diffusion?', o: ['Câmera profissional', 'Modelo open-source de geração', 'Rede social', 'Editor de vídeo'], c: 1 },
    { q: 'Vantagem do Stable Diffusion sobre DALL-E?', o: ['Mais rápido', 'Pode rodar localmente e é open-source', 'Melhor qualidade', 'Mais fácil'], c: 1 },
    { q: 'O que é inpainting?', o: ['Pintar a mão', 'Editar regiões específicas de uma imagem', 'Criar imagem do zero', 'Salvar arquivo'], c: 1 },
    { q: 'Ferramenta para rodar SD localmente?', o: ['Automatic1111', 'Google Colab', 'Excel', 'PowerPoint'], c: 0 },
    { q: 'O que é LoRA no SD?', o: ['Um estilo pré-definido', 'Modelo de adaptação de baixa rank', 'Um filtro', 'Uma ferramenta de edição'], c: 1 },
    { q: 'Diferença DALL-E 2 e DALL-E 3?', o: ['Não há diferença', 'DALL-E 3 entende melhor prompts', 'DALL-E 2 é melhor', 'DALL-E 3 é mais simples'], c: 1 },
    { q: 'Como ControlNet melhora o controle?', o: ['Adiciona mais cores', 'Usa imagens de referência para pose/composição', 'Torna mais rápido', 'Remove ruído'], c: 1 },
    { q: 'O que é CFG Scale?', o: ['Tamanho da imagem', 'Quão fiel o resultado segue o prompt', 'Escala de cores', 'Tamanho do modelo'], c: 1 },
    { q: 'Importância dos checkpoints?', o: ['Não importam', 'São os pesos do modelo treinados em diferentes estilos', 'Só salvam progresso', 'São backups'], c: 1 },
  ],
  6: [
    { q: 'O que é chain-of-thought prompting?', o: ['Pensar antes de escrever', 'Raciocínio passo a passo no prompt', 'Encadear imagens', 'Cadeia de pensamento'], c: 1 },
    { q: 'Como usar few-shot prompting?', o: ['Dar exemplos antes da instrução', 'Usar poucos prompts', 'Treinar a IA', 'Tirar poucas fotos'], c: 0 },
    { q: 'O que é prompt injection?', o: ['Injetar cor', 'Manipular a IA com instruções adversas', 'Adicionar texto', 'Editar imagem'], c: 1 },
    { q: 'Importância do contexto em prompts complexos?', o: ['Não importa', 'Define o quadro de referência para a IA', 'Apenas decorativo', 'Só para textos'], c: 1 },
    { q: 'Como usar prompts condicionais?', o: ['Usar se/então no prompt', 'Definir condições visuais', 'Não é possível', 'Só com código'], c: 1 },
    { q: 'O que é temperature nos modelos?', o: ['Temperatura da lente', 'Controla criatividade/aleatoriedade', 'Temperatura da cor', 'Velocidade de processamento'], c: 1 },
    { q: 'Como estruturar prompt com múltiplos elementos?', o: ['Lista separada por vírgulas', 'Um prompt por elemento', 'Não é possível', 'Só com IA especializada'], c: 0 },
    { q: 'O que é prompt chaining?', o: ['Encadear prompts em sequência', 'Prender prompts', 'Copiar prompts', 'Apagar prompts'], c: 0 },
    { q: 'Como resolver ambiguidades?', o: ['Ignorar', 'Ser mais específico e detalhado', 'Usar menos palavras', 'Pedir para a IA decidir'], c: 1 },
    { q: 'O que é metaprompting?', o: ['Prompt grande', 'Criar prompts para gerar outros prompts', 'Prompt de metal', 'Prompt secreto'], c: 1 },
  ],
  7: [
    { q: 'Como descrever estilo cinematográfico?', o: ['Usar termos de cinema (shot type, lighting)', 'Dizer filme', 'Usar apenas cores', 'Não é possível'], c: 0 },
    { q: 'O que define film noir?', o: ['Cores vibrantes', 'Contraste alto, sombras dramáticas, tons escuros', 'Neon', 'Natureza'], c: 1 },
    { q: 'Como simular películas analógicas?', o: ['Descrever grain, cores desbotadas, vintage', 'Usar digital only', 'Não é possível', 'Apenas com filtro'], c: 0 },
    { q: 'Estilo minimalista = ?', o: ['Muitos elementos', 'Poucos elementos, espaço negativo, limpo', 'Colorido', 'Abstrato'], c: 1 },
    { q: 'O que é bokeh?', o: ['Tipo de lente', 'Desfoque estético do fundo', 'Um filtro', 'Estilo de pintura'], c: 1 },
    { q: 'Como gerar estética anos 80?', o: ['Cores neon, VHS, grid', 'Tons pastéis', 'Preto e branco', 'Minimalista'], c: 0 },
    { q: 'Fotos com alta saturação = ?', o: ['Muted', 'Vibrant (vibrante)', 'Neutro', 'Tons frios'], c: 1 },
    { q: 'Como criar estilo aquarela?', o: ['Descrever watercolor no prompt', 'Usar óleo', 'Fotorealista', 'Pixel art'], c: 0 },
    { q: 'O que é color grading?', o: ['Avaliar cores', 'Ajuste artístico de cores na pós-produção', 'Criar paleta', 'Mesclar imagens'], c: 1 },
    { q: 'Como combinar múltiplos estilos?', o: ['Descrever estilos separados por vírgula', 'Só um estilo por prompt', 'Não é possível', 'Usar vários prompts'], c: 0 },
  ],
  8: [
    { q: 'Como descrever golden hour?', o: ['Luz quente, dourada, sombras longas', 'Luz fria azul', 'Sem sombras', 'Neon'], c: 0 },
    { q: 'O que é iluminação Rembrandt?', o: ['Luz lateral criando triângulo na bochecha', 'Luz de cima', 'Luz traseira', 'Flash direto'], c: 0 },
    { q: 'Diferença luz dura e macia?', o: ['Dura: sombras definidas; Macia: sombras suaves', 'Dura: colorida; Macia: PB', 'São iguais', 'Dura é melhor'], c: 0 },
    { q: 'Como pedir iluminação neon?', o: ['Descrever neon lighting, cyberpunk', 'Dizer luz artificial', 'Não é possível', 'Só com filtros'], c: 0 },
    { q: 'O que são cores complementares?', o: ['Cores opostas no círculo cromático', 'Cores iguais', 'Tons de cinza', 'Cores quentes'], c: 0 },
    { q: 'Como descrever sombras dramáticas?', o: ['High contrast, deep shadows, chiaroscuro', 'Sem sombras', 'Suaves', 'Coloridas'], c: 0 },
    { q: 'Efeito da luz backlight?', o: ['Contorno dourado no sujeito', 'Sombra no rosto', 'Tudo escuro', 'Sem efeito'], c: 0 },
    { q: 'Como usar paleta de cores no prompt?', o: ['Listar cores desejadas', 'Não é possível', 'Só com hexadecimal', 'Apenas colorido'], c: 0 },
    { q: 'O que é chiaroscuro?', o: ['Contraste extremo luz/sombra', 'Paleta de cores', 'Tipo de lente', 'Estilo moderno'], c: 0 },
    { q: 'Como controlar temperatura de cor?', o: ['Descrever warm/cool tones', 'Não é possível', 'Só na edição', 'Com filtros'], c: 0 },
  ],
  9: [
    { q: 'O que é upscale com IA?', o: ['Aumentar volume', 'Aumentar resolução mantendo qualidade', 'Diminuir tamanho', 'Mudar cor'], c: 1 },
    { q: 'Como remover fundo com IA?', o: ['Ferramenta de background removal', 'Cortar manualmente', 'Não é possível', 'Só no Photoshop'], c: 0 },
    { q: 'O que é inpainting na edição?', o: ['Injetar tinta', 'Preencher/editar partes específicas da imagem', 'Criar imagem nova', 'Apagar tudo'], c: 1 },
    { q: 'Como harmonizar cores entre imagens?', o: ['Color matching com IA', 'Ignorar', 'Só manualmente', 'Não é possível'], c: 0 },
    { q: 'Ferramenta para trocar céu?', o: ['Sky replacement com IA', 'Pintar manualmente', 'Não existe', 'Só com green screen'], c: 0 },
    { q: 'O que é outpainting?', o: ['Pintar fora', 'Expandir a imagem além do original', 'Sair do modo', 'Salvar externamente'], c: 1 },
    { q: 'Como aplicar filtros estilísticos?', o: ['Via ferramentas de style transfer', 'Não é possível', 'Só com presets', 'Apenas manual'], c: 0 },
    { q: 'Importância do denoise?', o: ['Remover ruído para melhorar qualidade', 'Adicionar ruído', 'Não é importante', 'Diminuir resolução'], c: 0 },
    { q: 'O que é super-resolution?', o: ['Resolução superior', 'Aumentar resolução com IA mantendo detalhes', 'Resolução máxima', 'Escala de cinza'], c: 1 },
    { q: 'O que é style transfer?', o: ['Transferir arquivo', 'Aplicar estilo de uma imagem em outra', 'Copiar estilo manualmente', 'Enviar por email'], c: 1 },
  ],
  10: [
    { q: 'Resolução ideal para posts Instagram?', o: ['1920x1080', '1080x1080 ou 1080x1350', '4K', '480p'], c: 1 },
    { q: 'Como criar carrosséis com IA?', o: ['Gerar imagens com tema consistente', 'Só uma imagem', 'Não é possível', 'Copiar de outros'], c: 0 },
    { q: 'Proporção ideal para Reels?', o: ['16:9', '9:16 (vertical)', '1:1', '4:3'], c: 1 },
    { q: 'Como criar thumbnails chamativas?', o: ['IA gera variações de composição e cores', 'Só texto', 'Não é possível', 'Só com captura de tela'], c: 0 },
    { q: 'O que é feed coeso?', o: ['Feed que atualiza rápido', 'Visual consistente em todas as postagens', 'Feed bagunçado', 'Só fotos de comida'], c: 1 },
    { q: 'Formato que gera mais engajamento?', o: ['Vídeo curto', 'Imagem estática', 'Texto puro', 'Link externo'], c: 0 },
    { q: 'Como criar Stories visuais consistentes?', o: ['Manter paleta de cores e estilo', 'Variar tudo', 'Não postar stories', 'Só repostar'], c: 0 },
    { q: 'Importância de hashtags?', o: ['Não tem importância', 'Aumentam alcance e descoberta', 'Apenas decorativas', 'São proibidas'], c: 1 },
    { q: 'Como adaptar para diferentes plataformas?', o: ['Recortar e redimensionar com IA', 'Usar a mesma imagem', 'Não é possível', 'Só manualmente'], c: 0 },
    { q: 'O que é A/B testing de imagens?', o: ['Testar versões diferentes para ver qual performa melhor', 'A e B são iguais', 'Teste de audio', 'Não existe'], c: 0 },
  ],
  11: [
    { q: 'Como a IA auxilia design gráfico?', o: ['Gera layouts, mockups e elementos', 'Não auxilia', 'Só escreve código', 'Só edita vídeo'], c: 0 },
    { q: 'O que é moodboard com IA?', o: ['Painel de referências visuais gerado por IA', 'Quadro branco', 'Tipo de lente', 'Software de código'], c: 0 },
    { q: 'Como gerar paletas de cores?', o: ['Ferramentas de IA para paletas harmônicas', 'Escolher ao acaso', 'Não é possível', 'Só com robô'], c: 0 },
    { q: 'Ferramenta para logos com IA?', o: ['Looka, Brandmark, DALL-E', 'Excel', 'Word', 'PowerPoint'], c: 0 },
    { q: 'Como criar mockups com IA?', o: ['Gerar previews realistas de design em contexto', 'Imprimir e fotografar', 'Não é possível', 'Só com Photoshop'], c: 0 },
    { q: 'O que é design system?', o: ['Sistema solar', 'Conjunto de regras e componentes visuais padronizados', 'Tipo de fonte', 'Programa de desenho'], c: 1 },
    { q: 'Como criar patterns com IA?', o: ['Descrever pattern desejado no prompt', 'Desenhar à mão', 'Não é possível', 'Só com template'], c: 0 },
    { q: 'Importância da tipografia?', o: ['Não importa', 'Define tom e hierarquia visual', 'Só decoração', 'Só para impressão'], c: 1 },
    { q: 'Como gerar ícones com IA?', o: ['Descrever ícone no prompt', 'Comprar prontos', 'Desenhar à mão', 'Não é possível'], c: 0 },
    { q: 'Como integrar IA no fluxo de design?', o: ['Usar IA para brainstorming, prototipagem e iteração', 'Não integrar', 'Substituir todo trabalho humano', 'Só para tarefas simples'], c: 0 },
  ],
  12: [
    { q: 'Fluxo ideal com IA fotográfica?', o: ['Conceito → Prompt → Geração → Seleção → Edição', 'Só gerar', 'Só editar', 'Só conceito'], c: 0 },
    { q: 'Como organizar bibliotecas de prompts?', o: ['Por categoria, estilo e resultado', 'Em ordem alfabética', 'Não organizar', 'Só na memória'], c: 0 },
    { q: 'O que é versionamento de prompts?', o: ['Guardar versões diferentes de prompts', 'Apagar antigos', 'Não existe', 'Só com git'], c: 0 },
    { q: 'Como integrar múltiplas ferramentas IA?', o: ['Usar cada ferramenta para sua melhor função', 'Só usar uma', 'Não integrar', 'Inventar novas'], c: 0 },
    { q: 'Caso de uso para e-commerce?', o: ['Fotos de produto geradas por IA', 'Só fotos reais', 'Não existe', 'Vídeos apenas'], c: 0 },
    { q: 'Como criar portfólio com imagens IA?', o: ['Selecionar melhores e creditar uso de IA', 'Tudo publicar', 'Não usar IA no portfólio', 'Esconder IA'], c: 0 },
    { q: 'O que é licensing de imagens com IA?', o: ['Sistema solar', 'Regras de uso e direitos autorais de imagens geradas', 'Tipo de lice', 'Licença de conducir'], c: 1 },
    { q: 'Como cobrar por serviços de IA?', o: ['Por projeto, por imagem ou por hora', 'Não cobrar', 'Só trocar favores', 'Dar de graça'], c: 0 },
    { q: 'Ética profissional com IA?', o: ['Transparência, credibilidade e respeito', 'Não existe', 'Pode copiar tudo', 'Não precisa mencionar'], c: 0 },
    { q: 'Como se manter atualizado?', o: ['Comunidades, tutoriais e experimentação', 'Não precisa', 'Só ler um livro', 'Esperar'], c: 0 },
  ],
};

async function main() {
  console.log('Inserindo quizzes e perguntas...');
  for (const mod of modules) {
    const quizId = randomUUID();
    await p.quiz.upsert({
      where: { moduleId: mod.id },
      update: {},
      create: { id: quizId, moduleId: mod.id, title: 'Quiz: ' + mod.name, source: 'seed' },
    });
    const existing = await p.quizQuestion.findMany({ where: { quizId } });
    if (existing.length > 0) continue;
    const qs = allQuestions[mod.order];
    if (!qs) continue;
    for (let i = 0; i < qs.length; i++) {
      const qId = randomUUID();
      await p.quizQuestion.create({
        data: {
          id: qId, quizId, order: i + 1, question: qs[i].q, correctIndex: qs[i].c,
          options: { create: qs[i].o.map((text, j) => ({ id: randomUUID(), order: j, text })) },
        },
      });
    }
    console.log('  Módulo ' + mod.order + ': ' + qs.length + ' perguntas');
  }
  console.log('Done!');
  await p.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });

export type Submodule = {
  title: string;
  content: string;
  images: string[];
};

export type CourseModule = {
  id: number;
  num: string;
  title: string;
  icon: string;
  tag: string;
  summary: string;
  submodules: Submodule[];
};

export const MODULES: CourseModule[] = [
  {
    id: 1,
    num: "01",
    title: "Introdução à Injeção Eletrônica",
    icon: "🔍",
    tag: "Fundamentos",
    summary:
      "O Triplo C, a relação estequiométrica, a central de comando (ECU), os tipos e modos de injeção e a visão geral de sensores, atuadores e diagnóstico.",
    submodules: [
      {
        title: "O que é Injeção Eletrônica — O Triplo C",
        content:
          "O sistema de injeção eletrônica tem uma função básica: fornecer combustível para os cilindros em combustão, porém, com precisão.\nPara o motor funcionar são fundamentais os três C: Combustível (gasolina, álcool ou GNV), Comburente (o oxigênio aspirado pelo ar) e Calor, fornecido pela centelha da bobina de alta tensão e entregue pela vela dentro da câmara de combustão.\nO motor é uma bomba de vácuo; nas primeiras injeções a eletrônica cuidava só do combustível e a ignição do calor, mas hoje o módulo controla injeção e ignição com precisão.",
        images: [],
      },
      {
        title: "Relação Estequiométrica",
        content:
          "Existe uma relação estequiométrica entre ar e combustível, mensurada em massa (KG), que determina a quantidade ideal de oxigênio para a queima de cada combustível, sem sobrar ou faltar nenhum dos dois.\nSegundo o livro: gasolina pura 14,7:1, gasolina comum 13,2:1, etanol 9,0:1, diesel 15,2:1, metanol 6,4:1 e hidrogênio 34,0:1.\nNo exemplo dado, um motor aspirando 100 gramas de oxigênio por ciclo injeta 7,57 gramas de gasolina comum e 9,09 gramas de etanol — por isso o sistema flex compensa injetando mais combustível.",
        images: [],
      },
      {
        title: "Central de Injeção Eletrônica (ECU)",
        content:
          "A central de injeção eletrônica, conhecida como UCE (Unidade de Controle Eletrônico) ou ECU (Electronic Control Unit), é basicamente um computador.\nEla recebe dados de sensores, como temperatura da água e do ar, pressão do coletor e posição do acelerador, processa essas informações e controla os dispositivos de gerenciamento do motor: injeção de combustível, marcha lenta e ignição.\nExistem centrais analógicas, sem comunicação com scanner, e digitais, com conector de diagnóstico; há pelo menos 16 anos as centrais cuidam de combustível e ignição juntas.",
        images: [],
      },
      {
        title: "Tipos de Injeção: Monoponto",
        content:
          "A injeção monoponto é caracterizada por ter somente um injetor para todos os cilindros do motor, instalado acima da borboleta de aceleração.\nO eletroinjetor injeta combustível em todas as fases de aspiração e o sistema trabalha com vazão de injetor maior e pressão de combustível menor; é considerado ultrapassado e não é mais utilizado.\nPor questões de eficiência e redução de poluentes, foi solicitada sua modificação para o sistema multiponto em 1997; sua aparência física lembra o carburador, mas as semelhanças param por aí.",
        images: [],
      },
      {
        title: "Tipos de Injeção: Multiponto",
        content:
          "A injeção multiponto possui um injetor para cada cilindro, instalado mais próximo ao cabeçote, individualmente no duto do cilindro, trabalhando com pressão de combustível maior e melhor atomização.\nComo a injeção ocorre próxima às válvulas de admissão, pelo coletor passa somente ar, permitindo maior diâmetro, melhor preenchimento dos cilindros, ganho de potência e redução da condensação nas paredes frias do coletor.\nA rampa de injetores, também chamada de flauta, recebe e distribui o combustível; o coletor de plástico oferece superfície lisa, menor peso e menor custo de fabricação.",
        images: [],
      },
      {
        title: "Modos de Injeção: Simultânea, Semissequencial e Sequencial",
        content:
          "Existem três modos de injeção: simultânea, semissequencial e sequencial.\nNo simultâneo, o mais antigo, todos os injetores são acionados ao mesmo tempo e o combustível fica em espera sobre a válvula; no semissequencial, ou banco a banco, a injeção ocorre nos cilindros gêmeos (1 e 4; 2 e 3) a cada 180º, com apenas um cilindro em espera, e também se aplica à ignição.\nO modo sequencial, o mais moderno, injeta individualmente na ordem de ignição e somente no cilindro em admissão, sem espera, exigindo sensores de posição do virabrequim e do comando de válvulas.",
        images: [],
      },
      {
        title: "Injeção Direta e Indireta",
        content:
          "As duas configurações de injeção são a indireta e a direta, e a principal diferença é o local do eletroinjetor.\nNo sistema indireto, usado desde os primórdios, o injetor fica no coletor de admissão, antes da válvula de admissão; no direto, o injetor é instalado na câmara de combustão, após as válvulas, exigindo pressão de combustível muito maior para vencer a pressão interna do motor.\nAs vantagens da injeção direta citadas no livro: atomização mais eficiente, controle preciso do ângulo de injeção, redução de consumo, resposta imediata de aceleração e maior torque — com alto custo de produção.",
        images: [],
      },
      {
        title: "Sensores e Atuadores — visão geral",
        content:
          "Os sensores mapeiam as condições do motor e informam à central os dados para calcular a massa de ar e a quantidade de combustível.\nEntre eles: ECT (temperatura do refrigerante), IAT (temperatura do ar), TPS (posição da borboleta), MAP (pressão do coletor), CKP (posição do virabrequim e PMS), CMP (fase do comando), sonda lambda O2 (oxigênio no escapamento) e o sensor KS (detonação).\nOs atuadores convertem pulsos elétricos em movimentos: bomba de combustível, eletroinjetor, bobina de ignição (eleva 12,6V a mais de 25kV), válvula de purga canister, relé de potência e atuador de marcha lenta.",
        images: [],
      },
      {
        title: "Auto Adaptação, Scanner e Tomada de Diagnóstico",
        content:
          "A UCE é auto adaptativa: adapta-se a desgastes de sensores e atuadores, do motor, do combustível (álcool, gasolina ou mistura em qualquer proporção) e até à forma de condução.\nApós trocar alguma peça, pode ser necessário resetar esses parâmetros com um scanner, que também lê os códigos DTC (Diagnostic Trouble Code), sensores, atuadores e funções especiais.\nAntigamente cada montadora tinha um conector próprio, como a Fiat com 3 vias; depois a tomada de diagnóstico foi universalizada no padrão OBD II, permitindo que um único cabo conecte na maioria dos veículos.",
        images: [],
      },
    ],
  },
  {
    id: 2,
    num: "02",
    title: "Sistema de Ignição",
    icon: "⚡",
    tag: "Faísca",
    summary:
      "Como a centelha nasce: bobina, cabo e vela, driver de ignição, tipos de bobinas, o gráfico padrão no osciloscópio e as falhas de ignição.",
    submodules: [
      {
        title: "Introdução ao Sistema de Ignição",
        content:
          "O sistema de ignição é responsável por fornecer a fonte de calor, ou seja, a centelha formada na vela de ignição dentro da câmara de combustão — um dos pilares do Triplo C.\nOs componentes que possibilitam a chegada da centelha são a bobina de ignição, o cabo de vela (se houver) e a vela; o ar sofre ruptura dielétrica em torno de 3kV por 1mm e, num motor com taxa de compressão de 10:1, teoricamente seriam necessários cerca de 30kV.\nO sistema transforma baixas tensões, como 12,6V, em até 30, 40 ou 50kV, e uma falha de ignição pode gerar falsa mistura pobre na sonda lambda, aumentando o consumo.",
        images: [],
      },
      {
        title: "Bobina de Ignição",
        content:
          "A bobina de ignição funciona como um elevador de tensão, multiplicando em milhares de vezes a tensão da bateria por princípios eletromagnéticos.\nEla possui dois circuitos no mesmo núcleo de ferro: o primário, com baixa tensão, alta corrente e número reduzido de espiras, e o secundário, com alta tensão e número muito superior de espiras.\nQuando a central corta a alimentação, surgem picos de 300V no primário; o tempo de carga é o dwell time, e o centelhamento ocorre em 4 etapas: alimentação, desalimentação, descarga do arco e residual da bobina.",
        images: [],
      },
      {
        title: "Cabo de Ignição",
        content:
          "Os cabos de ignição, ou cabos de vela, conduzem a alta tensão gerada pelo secundário da bobina até as velas, sendo compostos por um núcleo condutor e um isolamento externo que suporta altas temperaturas e altíssimas tensões elétricas.\nPor serem dispositivos de alta tensão, emitem ruído eletromagnético (EMI), suprimido com resistência no núcleo, ponteiras resistivas ou malhas de blindagem.\nCom o tempo podem surgir má vedação entre a vela e o terminal, causando fuga de corrente, e aumento da resistência do cabo, que limita a corrente da centelha e gera combustão ineficiente.",
        images: [],
      },
      {
        title: "Vela de Ignição",
        content:
          "A vela de ignição possui duas funções: ser o terminal de alta tensão onde ocorre o centelhamento e dissipar calor.\nParâmetros controlados são a folga entre eletrodos (GAP), em que quanto maior o GAP maior a tensão necessária, o índice térmico e o material/forma do eletrodo; velas com grau térmico maior são quentes (dissipam pouco) e com grau menor são frias (dissipam mais), o que é definido pela profundidade do isolador cerâmico.\nA vela trabalha entre 400 e 800 graus e, se aplicada errada, pode causar pré-ignição e até danificar o pistão do motor.",
        images: [],
      },
      {
        title: "Driver de Ignição",
        content:
          "O driver de ignição é um transistor de potência que funciona como um relé totalmente eletrônico, necessário pelas altas tensões geradas no primário, de 300 a 400V.\nExiste um transistor para cada canal de ignição, com três pinos: alimentação negativa (linha 31), pino de saída para a bobina e pino de alimentação do transistor (5V).\nA central chaveia o transistor com baixíssima corrente a partir de um pulso de 5V em onda quadrada, substituindo o platinado; o driver pode ficar dentro da central, num módulo externo ou embutido na própria bobina.",
        images: [],
      },
      {
        title: "Tipos de Bobinas",
        content:
          "Antigamente uma única bobina gerava centelha para todos os cilindros, distribuída pelo distribuidor; depois vieram bobinas com 4 saídas e 4 cabos e, em seguida, bobinas individuais por cilindro, dispensando os cabos.\nBobinas simples com 2 pinos dão acesso ao primário e as de 3 pinos possuem driver interno; o modelo DIS, conhecido como centelha perdida, tem 4 saídas e funcionamento semissequencial, fornecendo centelha a 2 cilindros gêmeos ao mesmo tempo, aproveitada pelo cilindro que está em compressão.\nUma bobina DIS com 3 pinos não possui driver interno, permitindo diagnóstico pelo primário ou secundário; o primário pode gerar 300V, exigindo atenção à entrada do osciloscópio.",
        images: [],
      },
      {
        title: "Gráfico Padrão no Osciloscópio",
        content:
          "O diagnóstico da ignição pode ser feito pela onda gráfica no osciloscópio ou analisador de motores, capturada no secundário com pinça indutiva no cabo de vela.\nAs características padrão analisadas: tempo de carga da bobina (dwell time), tensão de disparo da centelha, tempo de queima e residual de potência da bobina.\nA tensão de disparo é influenciada por desgaste da vela, resistência do sistema, pressão e temperatura do cilindro e mistura; por padrão, o tempo mínimo de queima é de 1ms e o residual deve apresentar pelo menos 3 ondinhas.",
        images: [],
      },
      {
        title: "Falhas de Ignição",
        content:
          "No caso de falha, a tensão de disparo ocorre e o tempo de queima começa, mas a combustão é interrompida e não há residual de bobina, o que aponta a substituição da bobina.\nO encurtamento na centelha indica fuga de corrente, por cabos, vela com cerâmica trincada ou bobina trincada, o que representa perigo ao osciloscópio.\nCom alta resistência, a tensão de disparo fica alta e o tempo de queima curto, como 621 microssegundos (0,62ms), com solução na substituição do cabo e da vela; o livro compara o conjunto a uma corda com roldana, em que maior tensão de disparo encolhe o tempo de queima.",
        images: [],
      },
    ],
  },
  {
    id: 3,
    num: "03",
    title: "Combustível",
    icon: "⛽",
    tag: "Combustível",
    summary:
      "Octanagem, gasolina e variações, etanol, a relação ar/combustível (AF) e o fator lambda — os conceitos que a central usa para calcular a mistura.",
    submodules: [
      {
        title: "Octanagem",
        content:
          "Octanagem, ou índice de octanas, é o índice de resistência do combustível à detonação e à pré-ignição em motores de combustão interna.\nPré-ignição é o fenômeno em que a mistura ar/combustível alcança a temperatura de ignição antes de receber a centelha, popularmente conhecido como batida de pino, detonação ou motor grilando.\nQuanto maior a compressão (taxa de compressão ou sobrealimentação), maior a temperatura interna e maior a octanagem exigida; como a gasolina tem menor octanagem que o álcool, adiciona-se álcool à gasolina para elevá-la; uma vela aplicada de forma errada também pode levar a mistura à pré-ignição.",
        images: [],
      },
      {
        title: "Gasolina, Gasolina Aditivada e Adulterada",
        content:
          "A gasolina é um combustível à base de petróleo formado por hidrocarbonetos e, em menor quantidade, por produtos oxigenados; a gasolina básica compõe-se de 8 átomos de carbono e 18 de hidrogênio, podendo receber aditivos como inibidores de corrosão, detergentes e corantes.\nA gasolina comum vendida no Brasil é a E-23, com cerca de 23% de álcool, e exige octanagem mínima de 87 IAD; a aditivada limpa e mantém limpos tanque, bomba, tubulação, bicos, válvulas, câmara e cabeçote, exige 89 IAD e não pode usar os corantes azul (reservado à aviação) e rosa (mistura MEG).\nA gasolina adulterada recebe solventes ou compostos não especificados, como aguarrás e benzina, que reduzem a octanagem, aumentam o consumo, agridem borrachas e vedações e formam carbonização que pode causar pré-ignição.",
        images: [],
      },
      {
        title: "Álcool Etílico (Etanol)",
        content:
          "O etanol (álcool etílico) é derivado de cereais e vegetais; no Brasil, a matéria-prima é principalmente a cana-de-açúcar, e o álcool comercializado é hidratado, com 5% a 6% de água.\nPor conter oxigênio em sua composição (2 átomos de carbono, 6 de hidrogênio e 1 de oxigênio), seu poder de queima é menor que o da gasolina, o que explica o maior consumo.\nO etanol tem alta resistência à detonação (equivalente a 110 octanas), combustão mais lenta e maior avanço de ignição, permitindo taxas de compressão mais elevadas; motores a etanol geram maior potência e torque com tempo de injeção superior, emitem menos poluentes e, por serem hidratados, trabalham com temperaturas internas menores na câmara.",
        images: [],
      },
      {
        title: "Relação Ar/Combustível (AF)",
        content:
          "A relação ar/combustível (AF, do inglês air-fuel) é a proporção entre comburente e combustível; a mistura estequiométrica é a quantidade ideal entre um e outro, sem que sobre nenhum reagente após a combustão.\nCom excesso de combustível sobra combustível após a queima (mistura rica); com excesso de oxigênio sobra oxigênio (mistura pobre), e o excedente de alguns produtos pode ainda formar novos produtos na reação química.\nPara uma noção das proporções reais, mil litros de ar correspondem a aproximadamente 1,2 kg; para queimar 1 kg de gasolina comum (13,2:1) são necessários cerca de 11 mil litros de ar, o equivalente a 11 caixas de água.\nComo a mistura perfeita quase nunca ocorre, existe a mistura estequiométrica (a desejada) e a mistura real (a obtida); a relação entre elas é o fator lambda.",
        images: [],
      },
      {
        title: "Fator Lambda",
        content:
          "Sempre comparada à relação estequiométrica, a mistura rica tem excesso de combustível (ou pouco ar) e a pobre tem falta de combustível (ou excesso de ar).\nO fator lambda (λ) é a relação entre a mistura que temos e a estequiométrica, calculada como a quantidade de ar real dividida pela quantidade de ar estequiométrica, o que torna a comunicação independente do tipo de combustível.\nCom λ = 1 a mistura é estequiométrica, com λ menor que 1 é rica e com λ maior que 1 é pobre; na gasolina, a relação estequiométrica é de 14,7:1.\nExemplos do livro: mistura pobre de 17,5:1 gera λ de 1,19 (17,5/14,7), mistura rica de 13:1 gera λ de 0,88, e um motor a etanol lendo 8:1, com estequiométrica de 9:1, resulta em λ de 0,88.",
        images: [],
      },
    ],
  },
  {
    id: 4,
    num: "04",
    title: "Alimentação Elétrica",
    icon: "🔋",
    tag: "Elétrica",
    summary:
      "Aterramento, linha 31, e queda de tensão: como a central de injeção é alimentada e por que o diagnóstico deve começar pela bateria.",
    submodules: [
      {
        title: "Aterramento",
        content:
          "Para conferir o aterramento da central, deve-se medir a tensão elétrica entre os pinos negativos da central de injeção e o negativo da bateria; também se confere a tensão entre o negativo da bateria e o chassis do veículo com ele em funcionamento.\nUma diferença de tensão acima de 200 mV entre o negativo da bateria e o chassis indica sistema de aterramento ineficaz, capaz de gerar falhas no sistema de injeção eletrônica.\nA diferença entre o negativo da bateria e os pinos de aterramento da central também não pode ultrapassar 200 mV; o aterramento é a linha 31, enquanto as alimentações positivas são as linhas 30 e 15, e na injeção eletrônica quase todos os atuadores são chaveados por negativo, com positivo constante e a central fornecendo o negativo de forma chaveada.",
        images: [],
      },
      {
        title: "Queda de Tensão",
        content:
          "A tensão da bateria, de em média 12,6V, varia conforme os consumidores e o circuito de carga: ligar farol e rádio, por exemplo, faz essa tensão diminuir.\nComo muitos sensores utilizam uma tensão de referência, a central possui internamente um regulador de tensão que transforma a tensão da bateria em 5V contínuos, garantindo precisão aos sensores independentemente da variação da bateria.\nEsse regulador possui limites mínimo e máximo de entrada; se a tensão ficar abaixo da mínima, o 5V fica comprometido.\nO processador da central também é alimentado com 5V além de outras linhas menores, como 3,3V; uma bateria com defeito (baixa corrente de partida a frio) pode derrubar a tensão abaixo do limite e fazer a central perder configurações, como a porcentagem de etanol na mistura — por isso o diagnóstico deve começar pela bateria.",
        images: [],
      },
    ],
  },
  {
    id: 5,
    num: "05",
    title: "Sensores",
    icon: "📡",
    tag: "Sinais",
    summary:
      "ECT, IAT, TPS, MAP, CKP, CMP, detonação, sonda lambda, VSS e MAF: o que cada sinal diz e como testar com multímetro e osciloscópio.",
    submodules: [
      {
        title: "Sensor de Temperatura da Água (ECT)",
        content:
          "O ECT é um termistor NTC: quando a temperatura sobe a resistência cai e quando ela cai a resistência sobe, funcionando como divisor de tensão com referência de 5V interna da UCE.\nEle usa 2 pinos, um de sinal e um negativo de referência, e com o circuito aberto o sinal vai a 5V, gerando DTC.\nNa prática, meça a resistência e compare com a temperatura: cerca de 5976 ohms a 0C, 2500 ohms a 20C, 1670 ohms a 40C, 800 ohms a 60C, 232 ohms a 90C e 175 ohms a 100C.\nPelo sinal também se percebe a abertura da termostática e o acionamento do eletroventilador; confira com scanner, multímetro ou osciloscópio, comparando com um termômetro.",
        images: [],
      },
      {
        title: "Sensor de Temperatura do Ar (IAT)",
        content:
          "O IAT é um NTC de funcionamento igual ao ECT, mas mede a temperatura do ar admitido em vez do líquido de arrefecimento.\nPode ficar exposto no coletor ou na mangueira de admissão, ou ser integrado ao MAF, ao MAP e ao corpo de borboleta, e não deve ser limpo com descarbonizantes ou solventes.\nNa primeira partida do dia, IAT e ECT devem marcar valores iguais ou muito próximos; se o ar marca 25C e a água 20C, a central enriquece a mistura com base nos 20C, causando marcha lenta ruim e cheiro de combustível.\nSinal que oscila bruscamente, como saltar de 25C para 28C em instantes, indica termistor com defeito.",
        images: [],
      },
      {
        title: "Sensor de Posição da Borboleta (TPS)",
        content:
          "O TPS é um potenciômetro que forma divisor de tensão e tem 3 pinos: alimentação 5V, negativo e sinal.\nO sinal varia de 0 a 5V conforme a borboleta vai de 0% a 100%, ou de 5V a 0V em sensores de padrão invertido; na prática deve ficar em torno de 100 mV a 4,8V, e 0V ou 5V exatos geram DTC de curto.\nAlém da posição, a UCE usa o TPS em estratégias de enriquecimento de aceleração, freio motor, marcha lenta, desaceleração e cut-off.\nTeste com multímetro, scanner ou osciloscópio acelerando progressivamente e verificando a ausência de buracos ou picos, tanto com a chave ligada quanto com o motor em funcionamento.",
        images: [],
      },
      {
        title: "Sensor de Pressão Absoluta (MAP)",
        content:
          "O MAP mede a pressão real dentro do coletor de admissão, instalado por tubulação ou acoplado diretamente, e é o principal sensor de cálculo de injeção, combinado com rotação e temperatura: quanto maior o MAP, mais combustível é injetado.\nNa marcha lenta e em baixa carga existe vácuo, pois a pressão interna é menor que a atmosférica, e ao ligar a chave a UCE lê cerca de 1013 mBar para se ajustar ao ambiente.\nA pinagem é 5V, negativo e sinal, e a versão TMAP acrescenta o IAT num quarto pino; o teto costuma ser 1150 mBar, maior em sobrealimentados.\nNo teste a fundo a pressão deve igualar a atmosférica, e o sensor não pode ser limpo com descarbonizante ou solvente.",
        images: [],
      },
      {
        title: "Sensor de Rotação e PMS (CKP): Indutivo e Efeito Hall",
        content:
          "O CKP informa rotação, posição do virabrequim, PMS, ponto de ignição, ponto de injeção e eficiência de combustão, lendo uma roda fônica dentada com falha, como a 60-2 (58 dentes e falha de 2) ou a 36-1; a cada dente do 60-2 o motor gira 6 graus.\nO indutivo tem ímã e bobina, gera tensão alternada senoidal, usa 2 pinos, não precisa de alimentação e tem a resistência medida com multímetro.\nO de efeito Hall é alimentado pela UCE com 5V, gera onda quadrada com cerca de 200 mV no nível baixo e 4,7V no alto, mantém a tensão constante independente da rotação e funciona bem a baixas rotações.\nSó com CKP a injeção é semissequencial.",
        images: [],
      },
      {
        title: "Sensor de Fase (CMP)",
        content:
          "O CMP é o sensor de posição do comando de válvulas e existe porque o CKP define o PMS, mas não o tempo dos cilindros.\nEle informa quando o pistão 1 entra em admissão/combustão, permitindo à UCE fazer injeção e ignição sequencial; sem ele o sistema cai para semissequencial, injetando em cilindros gêmeos.\nPode ser indutivo ou Hall, instalado no cabeçote sobre a engrenagem fônica do comando, e em alguns modelos a UCE consegue calcular rotação aproximada por ele, mantendo modo de segurança com potência reduzida.\nTambém serve para conferir o sincronismo virtual entre virabrequim e comando e verificar o funcionamento do variador de avanço de fase.",
        images: [],
      },
      {
        title: "Sensor de Detonação (KS) e Pré-Ignição",
        content:
          "O KS fica instalado no bloco e detecta batidas e vibrações; internamente tem uma massa e um cristal piezoelétrico que gera pulsos de tensão alternada sob esforço mecânico.\nAo detectar detonação, a UCE atrasa o ponto de ignição lentamente e por etapas até o fenômeno cessar ou atingir o limite de ajuste, depois reestabelece aos poucos; se o sinal ficar fraco, usa um mapa de segurança.\nEle não deve ser montado com arruelas ou calços, e o torque em geral não pode ultrapassar 20 Nm, pois excesso de aperto já coloca o veículo em estratégia de segurança.\nA detonação é a autocombustão das últimas partículas, com ruído metálico, enquanto a pré-ignição ocorre antes da centelha e não gera ruído.",
        images: [],
      },
      {
        title: "Sensor de Oxigênio (Sonda Lambda)",
        content:
          "A sonda lambda fica no escapamento antes do catalisador e às vezes depois, e informa à UCE a quantidade de oxigênio, comparando o gás com o oxigênio atmosférico para gerar tensão.\nA de banda estreita produz de 0 a 1100 mV sem alimentação externa: abaixo de 450 mV indica mistura pobre e acima, rica, oscilando constantemente; o aquecedor chega perto de 800C e a leitura já é eficiente entre 300C e 350C.\nA de 4 fios usa preto para sinal, cinza para negativo de referência e dois brancos para o aquecedor.\nA convencional tem resistência de 2 a 5 ohms com 12V integral, enquanto a planar tem 8 a 12 ohms e negativo por PWM controlado pela ECU, que acusa aquecedor rompido.\nA pós-catalisador monitora a eficiência do catalisador e oscila menos, em faixa mais pobre.",
        images: [],
      },
      {
        title: "Sensor de Velocidade (VSS)",
        content:
          "O VSS informa a velocidade do veículo e hoje está praticamente extinto, pois a UCE passou a usar o sinal do ABS.\nEle alimenta o velocímetro e serve a estratégias de desaceleração, cut-off e marcha lenta, podendo ser indutivo ou Hall e lendo uma roda fônica ou engrenagem acionada pelo diferencial; a UCE define a velocidade pela frequência do sinal.\nA maioria é de efeito Hall, com 3 pinos (alimentação, negativo e sinal em onda quadrada), muitas vezes funcionando com 12V, e os mesmos testes do CKP se aplicam.\nPor não depender da rotação para gerar sinal, o Hall responde bem a baixas velocidades, como 5 km/h, situação em que o indutivo é ruim; no diagnóstico mede-se a frequência, por exemplo 69 Hz, e compara-se com a literatura.",
        images: [],
      },
      {
        title: "Sensor de Fluxo de Ar (MAF): fio aquecido e filme aquecido",
        content:
          "O MAF mede a massa de ar que entra no motor e fica entre o filtro de ar e a TBI, sendo usado pela UCE junto com IAT e MAP para calcular o combustível; ao contrário do antigo debímetro, que media volume, ele mede massa.\nNo tipo fio aquecido o fio é mantido a cerca de 120C e a corrente necessária para isso é proporcional à massa de ar, havendo sempre um IAT acoplado e um aquecimento pós-desligamento para queimar impurezas.\nNo filme aquecido há uma listra central de aquecimento e dois sensores de temperatura, um antes e outro depois; sem fluxo as temperaturas são iguais, e com fluxo o primeiro resfria e o segundo aquece, gerando a diferença do sinal.\nO sinal de diagnóstico é digital, de 0 a 5V ou onda quadrada, lida por duty cycle ou tensão média.",
        images: [],
      },
    ],
  },
  {
    id: 6,
    num: "06",
    title: "Atuadores",
    icon: "🛠️",
    tag: "Comandos",
    summary:
      "Bomba de combustível, eletroinjetor, atuadores de marcha lenta, válvula canister e EGR: como a central comanda cada atuador na prática.",
    submodules: [
      {
        title: "Bomba de Combustível",
        content:
          "A bomba de combustível é um atuador comandado pela UCE, que ao ligar a chave a temporiza para pressurizar a linha e facilitar a partida, usando relé ou, nos sistemas mais modernos, um módulo de controle PWM.\nO ponto crítico é a corrente de consumo, que não pode ser muito alta: conector derretido no flange, comum em Renault, indica consumo elevado por sujeira no tanque, filtro entupido ou mangueira obstruída.\nPara veículos convencionais o ideal é ficar em até 6A, e valores como 6,57A já são considerados demasiadamente altos.\nMeça com garra amperimétrica DC, de preferência com osciloscópio, e dá para calcular a rotação pela fórmula RPM = 60000 dividido pelo tempo de um ciclo; com 8,70 ms o resultado é 6896 RPM.",
        images: [],
      },
      {
        title: "Eletroinjetor",
        content:
          "O eletroinjetor injeta e pulveriza o combustível; é uma válvula com agulha mantida fechada por mola, envolvida por uma bobina solenoide que recebe 12V positivo, enquanto a UCE comanda a abertura com pulsos negativos.\nA duração desse pulso é o tempo de injeção, e os furos calibrados na parte inferior pulverizam o combustível.\nComo é uma bobina, ele tem resistência mensurável; injetores de baixa impedância têm menor resistência e exigem mais corrente.\nNo osciloscópio aparece 12V no início, a queda negativa durante o tempo de injeção, um pico de tensão que pode chegar a 70V, exigindo atenuador, e a curva de desalimentação por causa do atraso mecânico de fechamento.\nCompare a amplitude dos 4 injetores: agulha suja, mola defeituosa ou bobina alterada mudam o fechamento.",
        images: [],
      },
      {
        title: "Atuador de Marcha Lenta (Tipo Solenoide)",
        content:
          "O atuador de marcha lenta tipo solenoide regula a marcha lenta com a borboleta fechada, criando um desvio extra de ar para o coletor, e não existe em sistemas Drive By Wire.\nPossui internamente um êmbolo e uma mola que mantém a passagem fechada em repouso, além de uma bobina alimentada por 12V e por um PWM negativo vindo da UCE.\nA UCE varia a abertura de 0% a 100% pelo duty cycle do pulso, ou seja, pela porcentagem de tempo em que o sinal fica negativo.\nEm 10% de duty o atuador tem pequena vazão; em 35%, vazão intermediária; e em 99%, fica praticamente em plena potência.\nMedindo com multímetro nesse último caso quase se lê a tensão da bateria, pois o PWM fica quase integralmente negativo.",
        images: [],
      },
      {
        title: "Atuador de Marcha Lenta (Motor de Passo)",
        content:
          "O atuador de marcha lenta por motor de passo pode ser acoplado à TBI ou usar um desviador de fluxo, com uma haste de ponta específica que limita a passagem de ar no by-pass.\nEle tem um estator com duas bobinas fixas de dois terminais cada e um rotor com ímã permanente e rosca sem fim: a haste não gira por ser guiada pela carcaça, então o giro do motor vira deslocamento axial de avanço ou retração.\nO giro é escalonado, por passos, e a polaridade das bobinas define o sentido horário ou anti-horário, com precisão que pode chegar a 0,04 mm por passo.\nA UCE calcula a marcha lenta usando ECT, IAT, CKP e TPS, e ao ligar ou desligar a chave faz aprendizado de mínimo e máximo até o fim de curso.\nTeste com caneta de polaridade nos 4 pinos, que devem pulsar ao ligar a chave e ao acelerar.",
        images: [],
      },
      {
        title: "Válvula Canister",
        content:
          "A válvula canister controla a purga dos vapores de combustível do tanque, que são poluentes e passam antes por um filtro de carvão vegetal ativo que retém hidrocarbonetos e libera só ar.\nOs gases são direcionados ao coletor para serem queimados somente quando a UCE determina, e a válvula pode ser alimentada com 12V permanente ou por PWM.\nO teste elétrico é medir a resistência da bobina, e o mecânico é verificar a estanqueidade: desligada, ela não pode permitir passagem de ar, pois travada aberta causa mistura rica.\nAbastecer até além do primeiro estralo pode levar gasolina ao canister e danificar filtro e válvula.\nNa maioria dos veículos a abertura começa só após 65C e, em 95% dos sistemas, ela nunca abre na partida ou no freio motor.",
        images: [],
      },
      {
        title: "Válvula EGR",
        content:
          "A válvula EGR recircula parte dos gases de escapamento para a admissão, diminuindo a temperatura da câmara de combustão e, com isso, a formação de NOx.\nEla pode ser mecânica, com acionamento pneumático por vácuo controlado por eletroválvulas chaveadas pela UCE, ou eletromagnética.\nNo modelo eletromagnético o funcionamento é parecido com o atuador de marcha lenta por solenoide: uma mola mantém o êmbolo fechado e a solenoide o puxa para liberar o fluxo, dispensando o acionamento pneumático, e muitas trazem internamente um sensor de posição para a UCE fazer o aprendizado e verificar o acionamento.\nPor interligar escapamento e admissão, é comum travar com sujeira e carbonização e ficar ineficiente, com contaminação ainda maior nos veículos diesel.\nMuitas válvulas EGR têm duas ligações de vácuo controladas por eletroválvulas.",
        images: [],
      },
    ],
  },
  {
    id: 7,
    num: "07",
    title: "Drive By Wire",
    icon: "🎛️",
    tag: "Eletrônica",
    summary:
      "Corpo de borboleta eletrônico (TBI), sensores de dupla pista, atuador, limpeza e aprendizado, e o pedal de acelerador.",
    submodules: [
      {
        title: "Corpo de Borboleta",
        content:
          "O corpo de borboleta (TBI) é o principal componente do sistema de acelerador eletrônico e funciona ao mesmo tempo como atuador e sensor, ficando sempre exposto às altas temperaturas do motor.\nNa parte sensorial/elétrica está o sensor de posição do acelerador, muito similar ao TPS, que recebe o movimento do eixo e o transforma em sinal elétrico para a UCE; na parte inferior fica o motor elétrico ligado ao eixo da borboleta por uma engrenagem.\nA UCE recebe a posição exata da borboleta pela parte sensorial e comanda a abertura por PWM conforme o pedal, dispensando o atuador de marcha lenta externo.",
        images: [],
      },
      {
        title: "Sensor e Sinal",
        content:
          "A parte de sinal/sensor da TBI informa a posição do eixo à UCE, confirmando que a borboleta abriu o suficiente, e é muito similar ao TPS comum, com a diferença de possuir um sinal duplo: são 2 pistas de posição de borboleta, por segurança e precisão, pois se uma falhar a outra ainda informa a UCE, que opera em estratégia de falha com redução de potência.\nAs duas pistas trabalham uma oposta à outra: uma vai de 0V a 5V e a outra de 5V a 0V, e a soma das duas deve sempre fechar a tensão de alimentação do sinal, com cerca de 2,5V no ponto médio.\nO desgaste costuma aparecer na faixa de aceleração mais baixa, e picos ou quedas exigem novos testes, pois a TBI fica perto do sistema de ignição, que pode causar interferência.",
        images: [],
      },
      {
        title: "Atuador e Chaveamento",
        content:
          "O atuador da TBI usa 2 dos 6 pinos do conector, responsáveis pelo motor elétrico com o qual a UCE abre ou fecha a borboleta.\nO motor é acionado por PWM, e alguns sistemas trabalham com alimentação positiva direta e PWM negativo, enquanto outros trabalham ao contrário, exigindo a medição das alimentações para saber qual processo usar.\nComo a polaridade para abrir a borboleta é diferente da de fechar, recomenda-se começar as medições na marcha lenta; no Mercedes CLA 200, a TBI recebia um positivo constante e um negativo via PWM.",
        images: [],
      },
      {
        title: "Limpeza e Aprendizado",
        content:
          "A sujidade e a carbonização entre a borboleta e a carcaça alteram o ponto mínimo de repouso; a injeção se ajusta até certo limite e, após isso, pode trabalhar de forma irregular, com a borboleta ficando mais aberta que o convencional.\nA limpeza deve ser feita fora do carro, acionando a borboleta manualmente e usando descarbonizante, sem submergir a TBI em produtos agressivos, que podem danificar as vedações e a parte interna.\nDepois, é preciso o aprendizado via scanner para a UCE reconhecer os novos mínimos e máximos; sem isso, ela pode manter a informação antiga e deixar o veículo acelerado, e ainda deve-se conferir a vedação TBI/coletor para não entrar ar falso.",
        images: [],
      },
      {
        title: "Pedal de Acelerador",
        content:
          "O pedal de acelerador é a outra parte do sistema drive by wire: seu sensor, muito similar ao TPS, transforma o movimento mecânico do pedal em sinal elétrico que a UCE interpreta como posição do pedal de acelerador, e em muitos casos o sensor é o próprio pedal.\nEle possui duas pistas para segurança e precisão do sinal, porém com padrão diferente da TBI: cada pista tem sua própria alimentação 5V e negativo, com a pista 1 variando de 0V a 5V e a pista 2 de 0V a 2,5V, sempre a metade da pista 1, na maioria dos pedais de 6 pinos.\nSensores com regulagem de fim de curso mal ajustada fazem a UCE entender aceleração indevida e impedir o recurso de marcha lenta.",
        images: [],
      },
    ],
  },
  {
    id: 8,
    num: "08",
    title: "Conversor Catalítico",
    icon: "🌱",
    tag: "Emissões",
    summary:
      "Como o catalisador transforma os gases nocivos, a temperatura mínima de operação e como a sonda pós-catalisador detecta perda de eficiência.",
    submodules: [
      {
        title: "Função do Conversor Catalítico",
        content:
          "O conversor catalítico, ou catalisador, é um recurso implementado para a redução da emissão de poluentes: na queima do combustível em motores ciclo Otto são produzidos CO2 e água, mas a queima incompleta gera ainda Monóxido de Carbono, Óxidos de Nitrogênio, Dióxido de Enxofre e vapores de Hidrocarbonetos, todos altamente nocivos à saúde e ao meio ambiente, com exceção do vapor de água.\nO catalisador é formado por uma colmeia de cerâmica, cujos minúsculos canais somam uma superfície equivalente a quatro campos de futebol, recoberta por pequenas quantidades de metais preciosos como paládio-ródio (gasolina), paládio-molibdênio (etanol), além de platina e ouro.\nO conjunto é enrolado em uma manta termo expansiva, que fixa, veda e isola termicamente, e montado em uma carcaça metálica, com a entrada voltada para o coletor de escapamento.",
        images: [],
      },
      {
        title: "Funcionamento e Controle de Eficiência",
        content:
          "Internamente, os gases resultantes da combustão são quimicamente transformados em gases menos nocivos, e para que isso ocorra corretamente o conversor deve estar com, no mínimo, 300°C, sendo a água que sai pelo escapamento um resultado direto da conversão catalítica.\nA sonda lambda pós-catalisador (sonda 2) trabalha com tensão mais baixa e estável quando o catalisador está com eficiência, pois a transformação química aumenta o nível de oxigênio no escapamento, marcando mistura pobre em combustível e rica em oxigênio.\nSe a sonda 2 acompanhar a sonda pré-catalisador, o catalisador está sem eficiência e deve ser substituído, pois o veículo fica mais poluente sem gerar falhas ao motor; ele também causa falhas quando entupido ou derretido, geralmente por problemas de ignição, sincronismo errado ou temperatura muito alta.",
        images: [],
      },
    ],
  },
  {
    id: 9,
    num: "09",
    title: "Estratégias de Injeção",
    icon: "🧠",
    tag: "Estratégia",
    summary:
      "Auto adaptação, marcha lenta, cut-off, abertura de AF, malha aberta e fechada, dashpot, luz de anomalia e modo alternativo.",
    submodules: [
      {
        title: "Parâmetros Auto Adaptativos",
        content:
          "Os parâmetros auto adaptativos permitem que a UCE se ajuste a variáveis que mudam com o tempo, como a pressão atmosférica, que varia de lugar para lugar. Incluem parâmetros de partida como tempo de injeção, ângulo de avanço de ignição e enriquecimento pós partida. Centrais de injeção sequencial mais modernas podem até compensar individualmente a baixa eficiência de um bico injetor em um cilindro.\nAtravés do scanner é possível resetar esses parâmetros; após revisão completa de velas, cabos e limpezas, é viável resetá-los para que a UCE se adapte novamente.",
        images: [],
      },
      {
        title: "Controle de Marcha Lenta",
        content:
          "Para habilitar a marcha lenta a UCE exige condições como posição do pedal ou TPS abaixo de um percentual, por exemplo 8%, e rotação do motor abaixo de determinado valor. Há mapas de correção por temperatura, com o sistema mais acelerado a frio e baixando a lenta até a temperatura normal de trabalho. Os atuadores de marcha lenta também possuem parâmetros auto adaptativos, exigindo às vezes reset ou aprendizado forçado.\nA entrada de ar falso no coletor de admissão eleva a rotação até ativar o cut-off, fechando o ciclo conhecido como lenta oscilando.",
        images: [],
      },
      {
        title: "Cut-Off",
        content:
          "O cut-off corta a alimentação de combustível, injetando zero combustível, quando o veículo está acima de 2000 RPM (alguns usam 2500 ou 1800) e o pedal ou TPS está em posição de marcha lenta. Ao baixar a rotação ou acelerar, a UCE retoma a injeção; no scanner o tempo de injeção marca 0ms e os bicos não trabalham até chegar na rotação de alimentação.\nPor isso, engatado descendo uma lomba ou parando no semáforo é mais econômico que desengatado, além de poupar freio pelo freio motor.",
        images: [],
      },
      {
        title: "Abertura de AF",
        content:
          "A UCE está sempre buscando a estequiometria, alterando o tempo de injeção para compensar o combustível utilizado. Quando desligamos o veículo com um quarto de tanque e, ao ligar, a UCE detecta meio ou três quartos, ela entende que houve abastecimento e habilita a abertura rápida de AF para corrigir a mistura; se a diferença for muito grande, passa a trabalhar o fator ar/combustível.\nPor isso o sensor de nível deve estar funcionando corretamente e o abastecimento deve ser feito com a chave desligada, caso contrário alguns sistemas não habilitam o aprendizado.",
        images: [],
      },
      {
        title: "Malha Aberta e Malha Fechada (Open/Closed Loop)",
        content:
          "Malha aberta, ou open loop, é quando a UCE ignora o sinal da sonda lambda e atua somente pelos mapas de injeção. Ocorre na primeira partida, quando a rotação está abaixo do valor predeterminado, na fase de aquecimento, em carga máxima com aceleração forte e, em alguns veículos, quando é detectada falha, enriquecendo toda a mistura.\nMalha fechada, ou closed loop, usa o sinal da sonda lambda para controlar a mistura em tempo real, alterando tempo de injeção e parâmetros; é utilizada quando a sonda e o motor estão aquecidos e sem falhas (DTC).",
        images: [],
      },
      {
        title: "DashPot",
        content:
          "O dashpot é uma estratégia usada em desacelerações para suavizar a variação de torque, tornando o freio motor mais suave. Quando a UCE nota a diminuição do ângulo da borboleta e rotação elevada, age sobre o atuador de marcha lenta ou a borboleta eletrônica reduzindo gradualmente a entrada de ar. Usa parâmetros como temperatura da água (ECT), posição da borboleta ou pedal, velocidade do veículo e rotação.\nAo parar no semáforo, abaixo da rotação de cut-off, a estratégia controla a injeção e a quantidade de ar na marcha lenta de forma mais sutil.",
        images: [],
      },
      {
        title: "Luz de Anomalia",
        content:
          "A luz de anomalia, ou luz de injeção, é considerada um atuador, pois a UCE a utiliza para indicar ao condutor quando uma DTC é gerada. A UCE reconhece como DTC falhas em estratégias, sinais incoerentes e componentes com circuito aberto.\nA lâmpada pode apagar mesmo sem o scanner caso o erro seja resolvido; por isso, em defeitos intermitentes a luz pode estar apagada com erros ainda gravados na memória.",
        images: [],
      },
      {
        title: "Modo Alternativo",
        content:
          "O modo alternativo é ativado quando um sensor falha ou o funcionamento do motor está irregular. Em circuito aberto no sensor de temperatura da água, a maioria assume um valor padrão de -40°C, deixando o veículo com excesso de combustível, e muitos sistemas usam um mapa de ignição fixo por segurança. Se o MAP falhar, a maioria utiliza o TPS como mapa principal de combustível, mantém a mistura enriquecida e usa curva de ignição fixa de segurança.\nCom falha no sensor da borboleta eletrônica a abertura é limitada; falha na motorização faz a mola de retorno manter uma marcha lenta acelerada de emergência, e falha no sensor do pedal mantém a marcha lenta constantemente elevada.",
        images: [],
      },
    ],
  },
  {
    id: 10,
    num: "10",
    title: "Sistema de Alimentação",
    icon: "🚗",
    tag: "Sistema",
    summary:
      "Bomba, regulador de pressão, bico injetor, vazão, estanqueidade, limpeza e retro lavagem, filtro e rampa de injeção.",
    submodules: [
      {
        title: "Bomba de Combustível",
        content:
          "Existem bombas mecânicas, usadas em sistemas com carburador, e elétricas, comuns na injeção. A função da bomba é gerar e fornecer vazão de combustível no sistema; quem gera pressão é o regulador, que cria a restrição. A bomba elétrica é alimentada com 12V pelo relé, geralmente é temporizada e é acionada por um pulso negativo ao ligar a chave.\nA elétrica trabalha com pressão de 1 a 5 bar; a mecânica de alta pressão usada na injeção direta, como a do Jetta, trabalha de 7 até 200 bar com válvula eletromagnética controlada pela UCE. O pré-filtro fica abaixo da bomba, e o conjunto costuma incluir o sensor de nível no copo ou módulo da bomba.",
        images: [],
      },
      {
        title: "Regulador de Pressão",
        content:
          "O regulador gera pressão por restrição de fluxo, sendo constituído de membrana e mola calibrada para a pressão de trabalho, por exemplo 3,5 bar. Quando a pressão de combustível passa desse valor, vence a mola e parte do combustível é aliviada pela membrana; quando cai, a mola tranca a passagem, num ciclo contínuo. Em um exemplo com vazão teórica de 200 litros por hora, sem o regulador o combustível circula apenas com vazão, sem pressão.\nO regulador tem uma tomada de vácuo ligada ao coletor de admissão; se a membrana furar, o motor aspira combustível em excesso. Para diagnosticar, aspire a tomada de vácuo e, se sair gasolina, o componente deve ser substituído.",
        images: [],
      },
      {
        title: "Bico Injetor",
        content:
          "Os eletroinjetores possuem características que exigem atenção: vazão, que define o quanto o bico injeta e é verificada na máquina de teste e limpeza ou com relógio de pressão e scanner; resistência elétrica, que não pode variar muito entre os bicos, sob risco de alterar o funcionamento e a corrente de consumo; e atomização ou leque, que raramente altera a eficiência do cilindro mesmo com mesma vazão.\nA estanqueidade verifica se, pressurizado em repouso sem acionamento, o bico não deixa passar combustível; o teste o submete a uma pressão de até 20% maior que a normal de trabalho, pois bicos sem estanqueidade gotejam e afogam o veículo na partida.",
        images: [],
      },
      {
        title: "Vazão de Bicos Injetores",
        content:
          "O teste de vazão é um dos mais utilizados no diagnóstico: verifica se todos os injetores injetam a mesma quantidade de fluido. A norma define que não pode haver mais de 10% de diferença de vazão entre os injetores. Num exemplo do livro, a base de 40 ML daria tolerância de 4 ML, ou seja, entre 36 e 44 ML; num teste real, o cilindro 3 ficou com 46 ML (excesso) e o cilindro 4 com 35 ML (falta).\nDeve-se também conferir a vazão base do bico, pois todos os injetores podem cair juntos e ainda estarem dentro dos 10%. As tabelas de vazões geralmente não são compatíveis entre uma máquina de teste e outra.",
        images: [],
      },
      {
        title: "Estanqueidade",
        content:
          "Estanqueidade significa estanque, sem vazamento. Na máquina de teste, os injetores são pressurizados com 10 a 20% acima da pressão de trabalho: para bicos que trabalham a 3 bar, recomenda-se de 3,3 a 3,6 bar. Se houver gotejamento, o bico não é estanque; ao desligar o veículo, o combustível entra no coletor de admissão e o motor afoga na partida, demorando a funcionar e cheirando a gasolina.\nTodo o sistema deve ser estanque: o regulador não pode devolver o combustível ao tanque imediatamente e a bomba tem válvula antirretorno na saída. No veículo, instala-se o manômetro na linha e verifica-se a queda de pressão de 1 a 2 horas após desligar; com o registro, inverte-se o relógio para testar a flauta e a bomba.",
        images: [],
      },
      {
        title: "Limpeza de Bicos e Retro Lavagem",
        content:
          "A limpeza padrão é por ultrassom: o injetor é mantido pulsando submerso em líquido detergente, e a vibração solta a sujidade. Deve-se retirar o pré-filtro do injetor e seguir o tempo pré-determinado pela fabricante; no caso da Mercedes do livro, o autor deixou de 5 a 6 vezes. Após a limpeza, os bicos devem ser testados novamente para confirmar a eficiência.\nA retro lavagem é um recurso extra quando o ultrassom não é suficiente: o injetor trabalha ao contrário, com combustível entrando por baixo e saindo por cima. Aplica-se retirando o pré-filtro, solto com uma ferramenta extratora (parafuso com extrator inercial), e instalando os injetores invertidos com adaptadores.",
        images: [],
      },
      {
        title: "Filtro de Combustível",
        content:
          "O filtro retém as impurezas que poderiam danificar as peças sensíveis do circuito e prejudicar o funcionamento dos injetores ou da bomba. Existe o pré-filtro, que fica abaixo do módulo da bomba, e outro filtro após a saída de combustível, que em alguns veículos fica dentro do tanque e na maioria externo, de fácil substituição.\nA troca é fundamental: se o filtro oferecer restrição, a bomba de combustível trabalha alterada e o sistema perde vazão de combustível na linha. Geralmente é conectado por engates rápidos pop top, próximo ao tanque, na parte inferior do veículo.",
        images: [],
      },
      {
        title: "Rampa de Injeção",
        content:
          "A rampa de injeção, ou flauta de injetores, tem a função de distribuir o combustível aos injetores e fazer a ligação com o circuito de alimentação. Fixada no cabeçote ou no coletor de admissão, pode ser de plástico ou de metal, conforme o veículo e o sistema.\nNo Santana com motor AP e injeção MI, o coletor de alumínio e a flauta de metal transferiam calor ao combustível, que aqueceu demais e em parte ficou gasoso. Por isso adotaram-se isoladores térmicos entre coletor e flauta, que devem ser mantidos originais, pois arruelas comuns de metal transferem calor. A flauta pode ou não possuir o regulador de pressão integrado.",
        images: [],
      },
    ],
  },
];

export function moduleTitle(id: number): string {
  return MODULES.find((m) => m.id === id)?.title ?? `Módulo ${id}`;
}
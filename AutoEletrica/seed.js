const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let seedCounter = 1;
function buildQuestion(question, options, correct) {
  const order = options.map((_, i) => i);
  const rnd = mulberry32(1000 + seedCounter++);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const shuffled = order.map((i) => options[i]);
  const correctIndex = shuffled.indexOf(correct);
  return {
    question,
    options: shuffled,
    correctIndex,
  };
}

const QUIZZES = [
  {
    moduleId: 1,
    title: "Avaliação — Introdução à Injeção Eletrônica",
    questions: [
      {
        question: "Qual é a relação estequiométrica da gasolina pura, segundo o livro?",
        options: ["9,0:1", "13,2:1", "14,7:1", "15,2:1"],
        correct: "14,7:1",
      },
      {
        question: "Um motor que aspira 100 gramas de oxigênio por ciclo precisa injetar de etanol:",
        options: ["7,57 g", "6,4 g", "14,7 g", "9,09 g"],
        correct: "9,09 g",
      },
      {
        question: "A central de injeção eletrônica é conhecida também pela sigla ECU, que significa:",
        options: [
          "Electronic Control Unit",
          "Engine Combustion Unit",
          "Energy Control Unit",
          "Electronic Calculation Unit",
        ],
        correct: "Electronic Control Unit",
      },
      {
        question: "O que caracteriza a injeção monoponto?",
        options: [
          "Um injetor para cada cilindro do motor",
          "Somente um injetor para todos os cilindros do motor",
          "Um carburador para cada cilindro",
          "Três injetores por cilindro",
        ],
        correct: "Somente um injetor para todos os cilindros do motor",
      },
      {
        question: "Em que ano foi solicitada a modificação do sistema monoponto para o multiponto?",
        options: ["2010", "1987", "1997", "2005"],
        correct: "1997",
      },
      {
        question: "No modo de injeção semissequencial de um motor 4 cilindros, quais são os cilindros gêmeos do Banco 1?",
        options: ["1 e 4", "2 e 3", "1 e 2", "3 e 4"],
        correct: "1 e 4",
      },
      {
        question: "No modo de injeção simultânea, a unidade de comando aciona:",
        options: [
          "um injetor por vez na ordem de ignição",
          "os injetores alternadamente em dois bancos",
          "todos os eletroinjetores ao mesmo tempo",
          "somente o injetor do cilindro em admissão",
        ],
        correct: "todos os eletroinjetores ao mesmo tempo",
      },
      {
        question: "No sistema de injeção direta, o eletroinjetor é instalado:",
        options: [
          "diretamente na câmara de combustão, após as válvulas de admissão",
          "no coletor de admissão, antes da válvula",
          "acima da borboleta de aceleração",
          "na rampa de injetores apenas",
        ],
        correct:
          "diretamente na câmara de combustão, após as válvulas de admissão",
      },
      {
        question: "Qual sensor informa à central a quantidade de oxigênio presente nos gases de escapamento?",
        options: ["MAP", "Sonda lambda (O2)", "IAT", "CKP"],
        correct: "Sonda lambda (O2)",
      },
      {
        question: "Para o motor funcionar, os três C do livro são:",
        options: [
          "Compressão, Calor e Curso",
          "Combustível, Comburente e Calor",
          "Comando, Carburador e Coletor",
          "Cilindro, Cabo e Continuidade",
        ],
        correct: "Combustível, Comburente e Calor",
      },
    ],
  },
  {
    moduleId: 2,
    title: "Avaliação — Sistema de Ignição",
    questions: [
      {
        question: "Segundo o livro, o ar sofre ruptura dielétrica e se torna condutor a partir de aproximadamente:",
        options: ["1 kV por 1 mm", "3 kV por 1 mm", "30 kV por 1 mm", "12,6 V por 1 mm"],
        correct: "3 kV por 1 mm",
      },
      {
        question: "Num motor com taxa de compressão 10:1, a tensão teórica necessária para gerar a centelha é próxima de:",
        options: ["3 kV", "10 kV", "12,6 V", "30 kV"],
        correct: "30 kV",
      },
      {
        question: "A bobina de ignição transforma a tensão da bateria (12,6V) em tensões de:",
        options: ["30, 40 ou 50 kV", "3 kV", "300 V", "25 V"],
        correct: "30, 40 ou 50 kV",
      },
      {
        question: "Quando a central corta a alimentação da bobina, é gerada uma tensão contrária com picos de:",
        options: ["12,6 V", "5 V", "300 V", "50 kV"],
        correct: "300 V",
      },
      {
        question: "O tempo em que a bobina permanece carregada é denominado:",
        options: ["Flashover", "Dwell Time", "GAP", "PMS"],
        correct: "Dwell Time",
      },
      {
        question: "Os cabos de ignição têm como função conduzir a corrente elétrica em alta tensão:",
        options: [
          "do secundário da bobina até as velas de ignição",
          "da bateria até o primário da bobina",
          "da vela até a bobina",
          "do distribuidor até o painel",
        ],
        correct: "do secundário da bobina até as velas de ignição",
      },
      {
        question: "As duas funções da vela de ignição são:",
        options: [
          "injetar combustível e resfriar o motor",
          "comprimir a mistura e abrir a válvula",
          "ser o terminal de alta tensão do centelhamento e dissipar calor",
          "gerar a faísca e medir a rotação",
        ],
        correct: "ser o terminal de alta tensão do centelhamento e dissipar calor",
      },
      {
        question: "O driver de ignição, que substitui o platinado, é na prática:",
        options: ["um transistor de potência", "uma vela de ignição", "um cabo de vela", "um relé mecânico"],
        correct: "um transistor de potência",
      },
      {
        question: "As bobinas do modelo DIS, conhecidas como centelha perdida, possuem:",
        options: [
          "um único injetor para dois cilindros",
          "4 saídas e funcionamento semissequencial, com centelha a 2 cilindros gêmeos",
          "apenas 2 pinos sem acesso ao primário",
          "driver de ignição sempre interno",
        ],
        correct: "4 saídas e funcionamento semissequencial, com centelha a 2 cilindros gêmeos",
      },
      {
        question: "No gráfico padrão de ignição, o tempo mínimo de queima definido no livro é de:",
        options: ["0,62 ms", "3 ondinhas", "5 ms", "1 ms"],
        correct: "1 ms",
      },
    ],
  },
  {
    moduleId: 3,
    title: "Avaliação — Combustível",
    questions: [
      {
        question: "Como é chamado popularmente o fenômeno em que a mistura entra em ignição antes de receber a centelha?",
        options: ["Falha de partida", "Batida de pino", "Efeito de cavitação", "Superaquecimento do ar"],
        correct: "Batida de pino",
      },
      {
        question: "A gasolina comum vendida no Brasil (E-23) contém em média quantos por cento de álcool?",
        options: ["15%", "23%", "30%", "5%"],
        correct: "23%",
      },
      {
        question: "O que torna uma gasolina adulterada?",
        options: [
          "A adição de solventes ou compostos não especificados para obter um produto de custo inferior",
          "O excesso de álcool dentro da especificação",
          "A ausência de corantes na formulação",
          "O uso de octanagem acima de 95 IAD",
        ],
        correct:
          "A adição de solventes ou compostos não especificados para obter um produto de custo inferior",
      },
      {
        question: "Qual cor de corante é proibida na gasolina comum terrestre por ser reservada à gasolina de aviação?",
        options: ["Verde", "Roxa", "Azul", "Amarela"],
        correct: "Azul",
      },
      {
        question: "Qual o percentual de água contido no álcool hidratado comercializado no Brasil?",
        options: ["5% a 6%", "23% a 25%", "1% a 2%", "40% a 45%"],
        correct: "5% a 6%",
      },
      {
        question: "Por que um motor a álcool consome mais combustível que o mesmo motor a gasolina?",
        options: [
          "Porque o etanol tem menor poder calorífico, pois o oxigênio aumenta o peso do combustível sem produzir energia",
          "Porque o etanol possui octanagem muito baixa",
          "Porque o etanol congela dentro dos bicos injetores",
          "Porque o motor a álcool trabalha com mistura mais pobre",
        ],
        correct:
          "Porque o etanol tem menor poder calorífico, pois o oxigênio aumenta o peso do combustível sem produzir energia",
      },
      {
        question: "A qual valor de octanagem o etanol equivale, para efeito de comparação?",
        options: ["87", "89", "95", "110"],
        correct: "110",
      },
      {
        question: "O que significa AF na injeção eletrônica?",
        options: ["Ar-Fria", "Air-Fuel (relação ar/combustível)", "Álcool Flex", "Advance Function"],
        correct: "Air-Fuel (relação ar/combustível)",
      },
      {
        question: "Segundo o livro, mil litros de ar correspondem aproximadamente a:",
        options: ["1,2 kg de ar", "11 kg de ar", "5 kg de ar", "14,7 kg de ar"],
        correct: "1,2 kg de ar",
      },
      {
        question: "O que indica um fator lambda menor que 1?",
        options: ["Mistura rica", "Mistura pobre", "Mistura estequiométrica", "Ausência de combustível"],
        correct: "Mistura rica",
      },
    ],
  },
  {
    moduleId: 4,
    title: "Avaliação — Alimentação Elétrica",
    questions: [
      {
        question: "Na injeção eletrônica, como é feito o chaveamento de praticamente todos os atuadores?",
        options: [
          "Pelo positivo, com a central fornecendo o positivo de forma chaveada",
          "Por negativo, com positivo constante e a central fornecendo o negativo de forma chaveada",
          "Por corrente alternada direta da bateria",
          "Sem chaveamento, ligados permanentemente",
        ],
        correct:
          "Por negativo, com positivo constante e a central fornecendo o negativo de forma chaveada",
      },
      {
        question: "Qual linha elétrica corresponde ao aterramento (alimentação negativa)?",
        options: ["Linha 31", "Linha 30", "Linha 15", "Linha 12"],
        correct: "Linha 31",
      },
      {
        question: "Onde se deve medir a tensão para testar o aterramento da central de injeção?",
        options: [
          "Entre os pinos positivos da central e o positivo da bateria",
          "Entre a linha 30 e a linha 15",
          "Entre o positivo da bateria e o chassis",
          "Entre os pinos negativos da central e o negativo da bateria",
        ],
        correct: "Entre os pinos negativos da central e o negativo da bateria",
      },
      {
        question: "A partir de qual diferença de tensão, entre o negativo da bateria e o chassis, considera-se o aterramento ineficaz?",
        options: ["100 mV", "5 V", "200 mV", "12,6 V"],
        correct: "200 mV",
      },
      {
        question: "No sistema de alimentação, o que representa a linha 30?",
        options: ["Alimentação positiva", "Aterramento", "Sinal de sensor", "Comunicação multiplexada"],
        correct: "Alimentação positiva",
      },
      {
        question: "Qual a tensão média fornecida pela bateria ao sistema de injeção eletrônica?",
        options: ["5 V", "12,6 V", "3,3 V", "24 V"],
        correct: "12,6 V",
      },
      {
        question: "Para qual valor o regulador de tensão interno da central transforma a tensão da bateria, alimentando os sensores?",
        options: ["3,3 V", "12,6 V", "9 V", "5 V"],
        correct: "5 V",
      },
      {
        question: "Além dos 5 V, qual outra linha de tensão alimenta o processador da central em muitos casos?",
        options: ["7 V", "1,5 V", "3,3 V", "12,6 V"],
        correct: "3,3 V",
      },
      {
        question: "Uma bateria com defeito, que derruba a tensão abaixo do limite do regulador, pode fazer a central:",
        options: [
          "perder configurações, como a porcentagem de etanol na mistura",
          "aumentar a octanagem do combustível",
          "trocar sozinha o tipo de combustível",
          "desligar permanentemente o regulador",
        ],
        correct: "perder configurações, como a porcentagem de etanol na mistura",
      },
      {
        question: "De onde o diagnóstico de problemas na injeção eletrônica deve partir, conforme o livro?",
        options: [
          "Do teste do sistema de partida e da bateria, por ser simples de verificar",
          "Do teste da bomba de combustível",
          "Da troca das velas de ignição",
          "Da regulagem da válvula borboleta",
        ],
        correct:
          "Do teste do sistema de partida e da bateria, por ser simples de verificar",
      },
    ],
  },
  {
    moduleId: 5,
    title: "Avaliação — Sensores",
    questions: [
      {
        question: "No sensor ECT, que é um termistor NTC, o que acontece com a resistência quando a temperatura sobe?",
        options: [
          "A resistência permanece constante",
          "A resistência aumenta",
          "A resistência diminui",
          "A resistência vai a infinito",
        ],
        correct: "A resistência diminui",
      },
      {
        question: "Na primeira partida do dia, espera-se que ECT e IAT marquem:",
        options: [
          "valores iguais ou muito próximos",
          "ECT sempre 40C acima do IAT",
          "IAT sempre acima de 100C",
          "sempre zero",
        ],
        correct: "valores iguais ou muito próximos",
      },
      {
        question: "Qual faixa de tensão de sinal é esperada no TPS na prática?",
        options: ["0V a 12V", "5 mV a 1V", "0 mV a 1100 mV", "100 mV a 4,8V"],
        correct: "100 mV a 4,8V",
      },
      {
        question: "Com a chave ligada e o motor parado, o MAP informa à UCE uma pressão próxima de:",
        options: ["0 mBar", "1013 mBar", "5 mBar", "2500 mBar"],
        correct: "1013 mBar",
      },
      {
        question: "A roda fônica 60-2 possui:",
        options: [
          "60 dentes e sem falha",
          "58 dentes e falha de 2",
          "36 dentes e falha de 1",
          "12 dentes e falha de 2",
        ],
        correct: "58 dentes e falha de 2",
      },
      {
        question: "Qual a principal função do sensor CMP para a UCE?",
        options: [
          "Medir a pressão do coletor",
          "Informar a temperatura do ar",
          "Identificar o tempo dos cilindros para injeção e ignição sequencial",
          "Medir a velocidade do veículo",
        ],
        correct:
          "Identificar o tempo dos cilindros para injeção e ignição sequencial",
      },
      {
        question: "O torque de instalação do sensor de detonação em geral não pode ultrapassar:",
        options: ["5 Nm", "20 Nm", "80 Nm", "120 Nm"],
        correct: "20 Nm",
      },
      {
        question: "Na sonda lambda de banda estreita, um sinal acima de 450 mV indica:",
        options: ["mistura rica", "mistura pobre", "aquecedor rompido", "circuito aberto"],
        correct: "mistura rica",
      },
      {
        question: "Por que a maioria dos sensores de velocidade usa efeito Hall?",
        options: [
          "Por ser mais barato apenas",
          "Por funcionar melhor em baixas velocidades, como 5 km/h",
          "Por gerar tensão alternada",
          "Por não precisar de alimentação",
        ],
        correct: "Por funcionar melhor em baixas velocidades, como 5 km/h",
      },
      {
        question: "No MAF de fio aquecido, a corrente para manter o fio em temperatura constante é proporcional à:",
        options: [
          "pressão atmosférica",
          "rotação do motor",
          "massa de ar que passa pelo sensor",
          "temperatura do óleo",
        ],
        correct: "massa de ar que passa pelo sensor",
      },
    ],
  },
  {
    moduleId: 6,
    title: "Avaliação — Atuadores",
    questions: [
      {
        question: "Segundo o livro, para veículos convencionais é interessante que a corrente da bomba de combustível fique em até:",
        options: ["2A", "6A", "15A", "30A"],
        correct: "6A",
      },
      {
        question: "Com um ciclo de 8,70 ms, a rotação calculada da bomba de combustível é aproximadamente:",
        options: ["1000 RPM", "3000 RPM", "6896 RPM", "12000 RPM"],
        correct: "6896 RPM",
      },
      {
        question: "A UCE comanda a abertura do eletroinjetor por meio de:",
        options: [
          "pulsos negativos, com alimentação positiva de 12V",
          "tensão alternada senoidal",
          "alimentação de 5V positiva e negativa",
          "sinal de frequência fixa",
        ],
        correct: "pulsos negativos, com alimentação positiva de 12V",
      },
      {
        question: "No osciloscópio, o pico de tensão do eletroinjetor pode chegar a:",
        options: ["5V", "12V", "70V", "300V"],
        correct: "70V",
      },
      {
        question: "No atuador de marcha lenta tipo solenoide, a UCE controla a abertura pela:",
        options: [
          "frequência do sinal alternado",
          "variação da resistência",
          "tensão de 5V",
          "porcentagem de duty cycle do PWM negativo",
        ],
        correct: "porcentagem de duty cycle do PWM negativo",
      },
      {
        question: "Com duty cycle de 10% em um atuador de marcha lenta por solenoide, quanto tempo o pulso fica negativo?",
        options: ["10% do tempo", "50% do tempo", "90% do tempo", "100% do tempo"],
        correct: "10% do tempo",
      },
      {
        question: "O atuador de marcha lenta por motor de passo tem, no estator:",
        options: [
          "uma única bobina de 4 terminais",
          "duas bobinas fixas de 2 terminais cada",
          "três bobinas de 1 terminal",
          "nenhuma bobina",
        ],
        correct: "duas bobinas fixas de 2 terminais cada",
      },
      {
        question: "Para testar o motor de passo com caneta de polaridade, espera-se que:",
        options: [
          "apenas 1 pino pulse",
          "os 4 pinos fiquem sempre positivos",
          "os 4 pinos pulsem ao ligar a chave e ao acelerar ou desacelerar",
          "os pinos fiquem em 0V permanentemente",
        ],
        correct: "os 4 pinos pulsem ao ligar a chave e ao acelerar ou desacelerar",
      },
      {
        question: "Na maioria dos veículos, a UCE só inicia a abertura da válvula canister após a temperatura atingir:",
        options: ["20C", "65C", "100C", "120C"],
        correct: "65C",
      },
      {
        question: "A válvula EGR tem a função de recircular gases de escapamento para:",
        options: [
          "aumentar a potência máxima",
          "resfriar o catalisador",
          "aumentar a octanagem",
          "reduzir a temperatura da câmara e a formação de NOx",
        ],
        correct: "reduzir a temperatura da câmara e a formação de NOx",
      },
    ],
  },
  {
    moduleId: 7,
    title: "Avaliação — Drive By Wire",
    questions: [
      {
        question: "Quantos pinos possui, na prática, o conector elétrico da maioria dos corpos de borboleta eletrônicos?",
        options: ["4", "5", "6", "8"],
        correct: "6",
      },
      {
        question: "Quantos pinos do conector da TBI são destinados à parte de sinal (sensor)?",
        options: ["2", "4", "3", "6"],
        correct: "4",
      },
      {
        question: "Como funcionam as duas pistas de sinal da TBI uma em relação à outra?",
        options: [
          "Ambas vão de 0V a 5V",
          "Uma vai de 0V a 2,5V e a outra de 0V a 5V",
          "Uma vai de 5V a 2,5V e a outra de 2,5V a 0V",
          "Uma vai de 0V a 5V e a outra de 5V a 0V",
        ],
        correct: "Uma vai de 0V a 5V e a outra de 5V a 0V",
      },
      {
        question: "Se uma pista da TBI estiver com 4V e a tensão de alimentação for 5V, qual deve ser a tensão da outra pista?",
        options: ["1V", "2V", "4V", "5V"],
        correct: "1V",
      },
      {
        question: "No meio do sinal das duas pistas da TBI, ambas devem estar com qual tensão?",
        options: ["1,5V", "5V", "2,5V", "0V"],
        correct: "2,5V",
      },
      {
        question: "Caso uma pista da TBI falhe, o que a UCE faz?",
        options: [
          "Substitui o sinal pelo pedal",
          "Ignora e mantém a potência total",
          "Desliga o motor",
          "Opera em estratégia de falha com redução de potência",
        ],
        correct: "Opera em estratégia de falha com redução de potência",
      },
      {
        question: "Na parte de potência, quantos pinos do conector da TBI são destinados ao motor elétrico (atuador)?",
        options: ["2", "4", "3", "6"],
        correct: "2",
      },
      {
        question: "O que se faz quando a sujidade na borboleta altera o ponto mínimo de repouso e o sistema passa a trabalhar irregular?",
        options: [
          "Reduzir a pressão da injeção",
          "Realizar descarbonização/limpeza e aprendizado via scanner",
          "Aumentar a quantidade de combustível",
          "Substituir somente o pedal",
        ],
        correct: "Realizar descarbonização/limpeza e aprendizado via scanner",
      },
      {
        question: "Como é a alimentação elétrica das pistas do pedal de acelerador em relação às da TBI?",
        options: [
          "Usam o mesmo 5V para as duas pistas",
          "Compartilham um único negativo",
          "Cada pista tem sua própria alimentação 5V e negativo",
          "Usam alimentação de 12V",
        ],
        correct: "Cada pista tem sua própria alimentação 5V e negativo",
      },
      {
        question: "No pedal de acelerador, se a pista 1 varia de 0V a 5V, como varia a pista 2?",
        options: [
          "De 0V a 2,5V, sempre a metade da pista 1",
          "De 2,5V a 5V, o dobro da pista 1",
          "De 5V a 0V, o oposto da pista 1",
          "De 0V a 5V, igual à pista 1",
        ],
        correct: "De 0V a 2,5V, sempre a metade da pista 1",
      },
    ],
  },
  {
    moduleId: 8,
    title: "Avaliação — Conversor Catalítico",
    questions: [
      {
        question: "Qual é o objetivo principal do conversor catalítico?",
        options: [
          "Aumentar a potência do motor",
          "Reduzir a emissão de poluentes",
          "Economizar combustível",
          "Aumentar a temperatura dos gases",
        ],
        correct: "Reduzir a emissão de poluentes",
      },
      {
        question: "Além de CO2 e água, quais compostos são produzidos pela queima incompleta do combustível?",
        options: [
          "CO, NOx, SO2 e vapores de hidrocarbonetos",
          "Somente oxigênio e nitrogênio",
          "Metano e ozônio",
          "Apenas vapores de água",
        ],
        correct: "CO, NOx, SO2 e vapores de hidrocarbonetos",
      },
      {
        question: "Qual é a característica da colmeia do catalisador?",
        options: [
          "Uma única folha lisa de metal",
          "Uma esponja de plástico",
          "Canais grandes que reduzem o fluxo de escapamento",
          "Canais minúsculos que somam superfície equivalente a quatro campos de futebol",
        ],
        correct:
          "Canais minúsculos que somam superfície equivalente a quatro campos de futebol",
      },
      {
        question: "Quais metais preciosos são usados no catalisador de veículos a gasolina?",
        options: ["Paládio-molibdênio", "Paládio-ródio", "Apenas ouro", "Ferro e cobre"],
        correct: "Paládio-ródio",
      },
      {
        question: "Qual é o metal precioso usado no catalisador de veículos a etanol?",
        options: ["Paládio-ródio", "Platina e ouro", "Paládio-molibdênio", "Ferro e cobre"],
        correct: "Paládio-molibdênio",
      },
      {
        question: "Qual a temperatura mínima de operação para o conversor catalítico realizar a conversão corretamente?",
        options: ["100°C", "200°C", "300°C", "500°C"],
        correct: "300°C",
      },
      {
        question: "O que a água que sai pelo escapamento indica?",
        options: [
          "Resultado da conversão catalítica dos gases de combustão",
          "Vazamento do líquido de arrefecimento",
          "Excesso de óleo no motor",
          "Falha na sonda lambda",
        ],
        correct: "Resultado da conversão catalítica dos gases de combustão",
      },
      {
        question: "Como a sonda 2 (pós-catalisador) se comporta quando o catalisador está com eficiência?",
        options: [
          "Tensão mais alta e oscilante",
          "Tensão sempre em 5V",
          "Sem tensão de sinal",
          "Tensão mais baixa e estável",
        ],
        correct: "Tensão mais baixa e estável",
      },
      {
        question: "Como a ECU detecta a perda de eficiência do catalisador?",
        options: [
          "Quando a temperatura do motor sobe acima de 100°C",
          "Quando a sonda 2 trabalha igual à sonda pré-catalisador",
          "Quando a sonda 2 fica sem sinal",
          "Quando o fluxo de ar da admissão aumenta",
        ],
        correct: "Quando a sonda 2 trabalha igual à sonda pré-catalisador",
      },
      {
        question: "Qual pode ser uma das causas de derretimento do catalisador?",
        options: [
          "Falhas no sistema de ignição e combustão incompleta",
          "Uso de gasolina aditivada",
          "Limpeza da TBI",
          "Falha no alternador",
        ],
        correct: "Falhas no sistema de ignição e combustão incompleta",
      },
    ],
  },
  {
    moduleId: 9,
    title: "Avaliação — Estratégias de Injeção",
    questions: [
      {
        question: "O que a UCE faz com os parâmetros auto adaptativos?",
        options: [
          "Ajusta variáveis que mudam com o tempo, como a pressão atmosférica",
          "Grava valores fixos de fábrica sem correções",
          "Desativa a sonda lambda em qualquer situação",
          "Apenas controla a luz de anomalia",
        ],
        correct: "Ajusta variáveis que mudam com o tempo, como a pressão atmosférica",
      },
      {
        question: "Quais condições habilitam basicamente a estratégia de marcha lenta?",
        options: [
          "Pedal acima de 50% e rotação máxima",
          "TPS ou pedal abaixo de um percentual (ex.: 8%) e rotação abaixo de determinado valor",
          "Velocidade acima de 80 km/h e freio acionado",
          "Pedal em repouso e TPS acima de 30%",
        ],
        correct:
          "TPS ou pedal abaixo de um percentual (ex.: 8%) e rotação abaixo de determinado valor",
      },
      {
        question: "Quais são as condições para o cut-off cortar o combustível?",
        options: [
          "Veículo acima de 2000 RPM (ou similar) com pedal/TPS em posição de marcha lenta",
          "Veículo acima de 8000 RPM com pedal totalmente acionado",
          "Temperatura da água acima de 90°C",
          "Ar-condicionado ligado na máxima",
        ],
        correct:
          "Veículo acima de 2000 RPM (ou similar) com pedal/TPS em posição de marcha lenta",
      },
      {
        question: "Durante o cut-off, quanto combustível é injetado?",
        options: [
          "Apenas metade da vazão normal",
          "A quantidade calculada pelo mapa de injeção",
          "Zero combustível, com tempo de injeção marcando 0ms no scanner",
          "O dobro, para resfriar o motor",
        ],
        correct: "Zero combustível, com tempo de injeção marcando 0ms no scanner",
      },
      {
        question: "Em que circunstâncias o sistema entra em malha aberta (open loop)?",
        options: [
          "Quando a sonda lambda controla a mistura em tempo real",
          "Quando o motor está aquecido e sem DTC",
          "Quando o veículo trafega em cruzeiro em rodovia",
          "Na primeira partida com rotação baixa, na fase de aquecimento, na carga máxima e em alguns casos de falha",
        ],
        correct:
          "Na primeira partida com rotação baixa, na fase de aquecimento, na carga máxima e em alguns casos de falha",
      },
      {
        question: "Quando o sistema trabalha em malha fechada (closed loop)?",
        options: [
          "Quando ignora a sonda e usa apenas os mapas de injeção",
          "Quando utiliza o sinal da sonda lambda em tempo real para regular a mistura",
          "Quando a rotação está acima de 8000 RPM",
          "Quando o veículo está com falhas no MAP",
        ],
        correct:
          "Quando utiliza o sinal da sonda lambda em tempo real para regular a mistura",
      },
      {
        question: "O que a entrada de ar falso provoca na marcha lenta?",
        options: [
          "A rotação sobe até o cut-off cortar combustível, fechando o ciclo da lenta oscilando",
          "A UCE passa a trabalhar em malha fechada permanentemente",
          "O sistema desliga a bomba de combustível",
          "A borboleta eletrônica fecha completamente",
        ],
        correct:
          "A rotação sobe até o cut-off cortar combustível, fechando o ciclo da lenta oscilando",
      },
      {
        question: "Quando a UCE habilita a abertura rápida de AF?",
        options: [
          "Ao detectar a rotação acima de 2000 RPM",
          "Ao detectar o pedal totalmente acionado",
          "Ao detectar diferença no nível do tanque que indica abastecimento, como de 1/4 para 1/2 ou 3/4",
          "Ao detectar a abertura do ar-condicionado",
        ],
        correct:
          "Ao detectar diferença no nível do tanque que indica abastecimento, como de 1/4 para 1/2 ou 3/4",
      },
      {
        question: "O que a luz de anomalia pode fazer quando o erro é resolvido?",
        options: [
          "A lâmpada permanece acesa em qualquer condição",
          "A lâmpada pisca para indicar manutenção preventiva",
          "A lâmpada apaga somente com a troca do sensor",
          "A lâmpada pode apagar mesmo sem o scanner, com erros ainda gravados em defeitos intermitentes",
        ],
        correct:
          "A lâmpada pode apagar mesmo sem o scanner, com erros ainda gravados em defeitos intermitentes",
      },
      {
        question: "Quando o sensor MAP falha, o que a maioria das UCEs faz em modo alternativo?",
        options: [
          "Usa a sonda lambda para calcular a carga do motor",
          "Usa o TPS como mapa principal, mantém a mistura enriquecida e curva de ignição fixa de segurança",
          "Assume a temperatura média do coletor de admissão",
          "Corta totalmente o fornecimento de combustível",
        ],
        correct:
          "Usa o TPS como mapa principal, mantém a mistura enriquecida e curva de ignição fixa de segurança",
      },
    ],
  },
  {
    moduleId: 10,
    title: "Avaliação — Sistema de Alimentação",
    questions: [
      {
        question: "Qual é a função da bomba de combustível?",
        options: [
          "Gerar pressão na linha de combustível",
          "Gerar e fornecer vazão de combustível no sistema",
          "Filtrar as impurezas do tanque",
          "Medir o nível de combustível do tanque",
        ],
        correct: "Gerar e fornecer vazão de combustível no sistema",
      },
      {
        question: "Com qual pressão trabalha normalmente a bomba elétrica de combustível?",
        options: ["De 1 a 5 bar", "De 7 a 200 bar", "De 15 a 30 bar", "Acima de 300 bar"],
        correct: "De 1 a 5 bar",
      },
      {
        question: "Como o regulador de pressão gera pressão no sistema?",
        options: [
          "Aumentando a rotação da bomba de combustível",
          "Resfriando o combustível na linha",
          "Através da restrição de fluxo, com membrana e mola calibrada (ex.: 3,5 bar)",
          "Pelo vácuo do coletor de admissão",
        ],
        correct:
          "Através da restrição de fluxo, com membrana e mola calibrada (ex.: 3,5 bar)",
      },
      {
        question: "O que ocorre quando a membrana do regulador de pressão fura?",
        options: [
          "O sistema perde pressão apenas na rampa",
          "O motor aspira combustível em excesso pela tomada de vácuo",
          "A bomba trava imediatamente",
          "O sensor de nível para de funcionar",
        ],
        correct: "O motor aspira combustível em excesso pela tomada de vácuo",
      },
      {
        question: "Qual é a tolerância definida pela norma para a diferença de vazão entre injetores?",
        options: ["No máximo 5%", "No máximo 2%", "No máximo 50%", "No máximo 10% de diferença de vazão"],
        correct: "No máximo 10% de diferença de vazão",
      },
      {
        question: "A que pressão os bicos são submetidos no teste de estanqueidade?",
        options: [
          "10 a 20% acima da pressão de trabalho (ex.: 3,3 a 3,6 bar para 3 bar)",
          "Na pressão atmosférica do local",
          "Na pressão máxima da bomba",
          "20% abaixo da pressão de trabalho",
        ],
        correct:
          "10 a 20% acima da pressão de trabalho (ex.: 3,3 a 3,6 bar para 3 bar)",
      },
      {
        question: "Como é feita a limpeza padrão dos injetores?",
        options: [
          "Aquecimento direto sobre a chama",
          "Jato de ar comprimido a seco",
          "Ultrassom com o injetor pulsando submerso em líquido detergente, com o pré-filtro retirado",
          "Lavagem por dentro com gasolina nova",
        ],
        correct:
          "Ultrassom com o injetor pulsando submerso em líquido detergente, com o pré-filtro retirado",
      },
      {
        question: "O que é a retro lavagem?",
        options: [
          "Lavagem com o injetor na posição normal",
          "Fazer o injetor trabalhar ao contrário, com combustível entrando por baixo e saindo por cima",
          "Lavar apenas o pré-filtro do injetor",
          "Aplicar alta tensão elétrica no bico",
        ],
        correct:
          "Fazer o injetor trabalhar ao contrário, com combustível entrando por baixo e saindo por cima",
      },
      {
        question: "Qual é a função da rampa de injeção, ou flauta de injetores?",
        options: [
          "Resfriar o combustível do circuito",
          "Gerar a pressão de trabalho do sistema",
          "Medir a vazão de ar de admissão",
          "Distribuir o combustível aos injetores e fazer a ligação com o circuito de alimentação",
        ],
        correct:
          "Distribuir o combustível aos injetores e fazer a ligação com o circuito de alimentação",
      },
      {
        question: "O que a restrição no filtro de combustível pode causar?",
        options: [
          "A bomba trabalha alterada e o sistema perde vazão de combustível na linha",
          "Aumenta a pressão além do limite da rampa",
          "O regulador fecha totalmente a passagem",
          "A luz de anomalia apaga sozinha",
        ],
        correct: "A bomba trabalha alterada e o sistema perde vazão de combustível na linha",
      },
    ],
  },
];

async function seedQuizzes() {
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  console.log("quizzes antigos apagados");

  for (const qz of QUIZZES) {
    const moduleId = MODULES_BY_ORDER[qz.moduleId];
    if (!moduleId) {
      console.log(`skip quiz (módulo ${qz.moduleId} não existe) — ${qz.title}`);
      continue;
    }
    const quiz = await prisma.quiz.create({
      data: {
        moduleId,
        source: "seed",
        title: qz.title,
        questions: {
          create: qz.questions.map((q, i) => {
            const b = buildQuestion(q.question, q.options, q.correct);
            return {
              order: i,
              question: b.question,
              correctIndex: b.correctIndex,
              options: {
                create: b.options.map((text, oi) => ({ order: oi, text })),
              },
            };
          }),
        },
      },
    });
    console.log(`quiz criado: Módulo ${qz.moduleId} — ${quiz.title} (${qz.questions.length} perguntas)`);
  }

  const total = await prisma.quiz.count();
  console.log(`total de quizzes agora: ${total}`);
}

const MODULE_SEEDS = [
  {"order": 1, "name": "Introdução à Injeção Eletrônica", "description": "1.1 — O que é Injeção Eletrônica — O Triplo C\n1.2 — Relação Estequiométrica\n1.3 — Central de Injeção Eletrônica (ECU)\n1.4 — Tipos de Injeção: Monoponto\n1.5 — Tipos de Injeção: Multiponto\n1.6 — Modos de Injeção: Simultânea, Semissequencial e Sequencial\n1.7 — Injeção Direta e Indireta\n1.8 — Sensores e Atuadores — visão geral\n1.9 — Auto Adaptação, Scanner e Tomada de Diagnóstico", "file": "mod-m01.pdf"},
  {"order": 2, "name": "Sistema de Ignição", "description": "2.1 — Introdução ao Sistema de Ignição\n2.2 — Bobina de Ignição\n2.3 — Cabo de Ignição\n2.4 — Vela de Ignição\n2.5 — Driver de Ignição\n2.6 — Tipos de Bobinas\n2.7 — Gráfico Padrão no Osciloscópio\n2.8 — Falhas de Ignição", "file": "mod-m02.pdf"},
  {"order": 3, "name": "Combustível", "description": "3.1 — Octanagem\n3.2 — Gasolina, Gasolina Aditivada e Adulterada\n3.3 — Álcool Etílico (Etanol)\n3.4 — Relação Ar/Combustível (AF)\n3.5 — Fator Lambda", "file": "mod-m03.pdf"},
  {"order": 4, "name": "Alimentação Elétrica", "description": "4.1 — Aterramento\n4.2 — Queda de Tensão", "file": "mod-m04.pdf"},
  {"order": 5, "name": "Sensores", "description": "5.1 — Sensor de Temperatura da Água (ECT)\n5.2 — Sensor de Temperatura do Ar (IAT)\n5.3 — Sensor de Posição da Borboleta (TPS)\n5.4 — Sensor de Pressão Absoluta (MAP)\n5.5 — Sensor de Rotação e PMS (CKP): Indutivo e Efeito Hall\n5.6 — Sensor de Fase (CMP)\n5.7 — Sensor de Detonação (KS) e Pré-Ignição\n5.8 — Sensor de Oxigênio (Sonda Lambda)\n5.9 — Sensor de Velocidade (VSS)\n5.10 — Sensor de Fluxo de Ar (MAF): fio aquecido e filme aquecido", "file": "mod-m05.pdf"},
  {"order": 6, "name": "Atuadores", "description": "6.1 — Bomba de Combustível\n6.2 — Eletroinjetor\n6.3 — Atuador de Marcha Lenta (Tipo Solenoide)\n6.4 — Atuador de Marcha Lenta (Motor de Passo)\n6.5 — Válvula Canister\n6.6 — Válvula EGR", "file": "mod-m06.pdf"},
  {"order": 7, "name": "Drive By Wire", "description": "7.1 — Corpo de Borboleta\n7.2 — Sensor e Sinal\n7.3 — Atuador e Chaveamento\n7.4 — Limpeza e Aprendizado\n7.5 — Pedal de Acelerador", "file": "mod-m07.pdf"},
  {"order": 8, "name": "Conversor Catalítico", "description": "8.1 — Função do Conversor Catalítico\n8.2 — Funcionamento e Controle de Eficiência", "file": "mod-m08.pdf"},
  {"order": 9, "name": "Estratégias de Injeção", "description": "9.1 — Parâmetros Auto Adaptativos\n9.2 — Controle de Marcha Lenta\n9.3 — Cut-Off\n9.4 — Abertura de AF\n9.5 — Malha Aberta e Malha Fechada (Open/Closed Loop)\n9.6 — DashPot\n9.7 — Luz de Anomalia\n9.8 — Modo Alternativo", "file": "mod-m09.pdf"},
  {"order": 10, "name": "Sistema de Alimentação", "description": "10.1 — Bomba de Combustível\n10.2 — Regulador de Pressão\n10.3 — Bico Injetor\n10.4 — Vazão de Bicos Injetores\n10.5 — Estanqueidade\n10.6 — Limpeza de Bicos e Retro Lavagem\n10.7 — Filtro de Combustível\n10.8 — Rampa de Injeção", "file": "mod-m10.pdf"},
];

const MODULES_BY_ORDER = {};

async function seedModules() {
  const created = await prisma.module.createMany({
    data: MODULE_SEEDS.map((s) => ({
      order: s.order,
      name: s.name,
      description: s.description,
      pdfUrl: `/arquivos/materiais/${s.file}`,
    })),
  });
  const rows = await prisma.module.findMany({
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });
  rows.forEach((m) => {
    MODULES_BY_ORDER[m.order] = m.id;
  });
  console.log(`módulos criados: ${created.count} (${MODULE_SEEDS.map((m) => m.name).join(", ")})`);
}
async function main() {
  console.log("=== WIPE ===");
  const delQ = await prisma.question.deleteMany();
  await prisma.module.deleteMany();
  const delU = await prisma.user.deleteMany();
  console.log(
    `questões de dúvidas apagadas: ${delQ.count}, módulos apagados, usuários apagados: ${delU.count}`
  );

  console.log("=== SEED ===");
  const aluno = await prisma.user.upsert({
    where: { email: "aluno.teste@auto.com" },
    update: {},
    create: {
      name: "Aluno Teste",
      email: "aluno.teste@auto.com",
      passwordHash: bcrypt.hashSync("aluno123", 10),
      role: "student",
    },
  });
  const prof = await prisma.user.upsert({
    where: { email: "professor.teste@auto.com" },
    update: {},
    create: {
      name: "Professor Teste",
      email: "professor.teste@auto.com",
      passwordHash: bcrypt.hashSync("prof123", 10),
      role: "teacher",
    },
  });
  const admin = await prisma.user.upsert({
    where: { email: "admin@auto.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@auto.com",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "admin",
    },
  });
  console.log(`aluno -> ${aluno.email} (${aluno.role})`);
  console.log(`professor -> ${prof.email} (${prof.role})`);
  console.log(`admin -> ${admin.email} (${admin.role})`);

  await seedModules();

  await seedQuizzes();

  const total = await prisma.user.count();
  console.log(`total de usuários agora: ${total}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
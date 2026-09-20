const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const p = new PrismaClient();

async function main() {
  const prof = await p.user.findUnique({ where: { email: 'professor.teste@fotoia.com' } });
  const aluno = await p.user.findUnique({ where: { email: 'aluno.teste@fotoia.com' } });
  if (!prof || !aluno) { console.log('Users not found'); return; }

  const topics = [
    { title: 'Dicas de prompts para retratos realistas', description: 'Compartilhe suas melhores dicas para criar retratos fotorrealistas com IA.', authorId: prof.id },
    { title: 'Qual ferramenta vocês preferem? Midjourney vs DALL-E vs Stable Diffusion', description: 'Discussão sobre vantagens e desvantagens de cada plataforma.', authorId: prof.id },
    { title: 'Meus primeiros resultados com Midjourney', description: 'Compartilhando minhas primeiras imagens geradas e pedindo feedback.', authorId: aluno.id },
    { title: 'Como criar iluminação dramática nos prompts?', description: 'Técnicas para descrever iluminação cinematográfica e dramática.', authorId: prof.id },
  ];

  for (const t of topics) {
    const topicId = randomUUID();
    await p.topic.create({ data: { id: topicId, ...t } });
    await p.topicMessage.create({ data: {
      id: randomUUID(), topicId, authorId: t.authorId,
      content: t.description
    }});
    console.log('Tópico: ' + t.title);
  }
  console.log('Done!');
  await p.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });

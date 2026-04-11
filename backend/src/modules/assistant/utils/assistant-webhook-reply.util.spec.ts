import { normalizeAssistantWebhookReply } from './assistant-webhook-reply.util';

describe('normalizeAssistantWebhookReply (respuesta n8n → TaskMaster)', () => {
  it('acepta string plano', () => {
    expect(normalizeAssistantWebhookReply('Hola')).toEqual({ text: 'Hola' });
  });

  it('lee campo text en objeto JSON', () => {
    expect(
      normalizeAssistantWebhookReply({ text: 'Respuesta del flujo' }),
    ).toEqual({ text: 'Respuesta del flujo' });
  });

  it('acepta message, reply, output o response como texto', () => {
    expect(normalizeAssistantWebhookReply({ message: 'M1' }).text).toBe('M1');
    expect(normalizeAssistantWebhookReply({ reply: 'R1' }).text).toBe('R1');
    expect(normalizeAssistantWebhookReply({ output: 'O1' }).text).toBe('O1');
    expect(normalizeAssistantWebhookReply({ response: 'S1' }).text).toBe('S1');
  });

  it('normaliza bullets o items o steps', () => {
    expect(
      normalizeAssistantWebhookReply({
        text: 'Lista',
        bullets: ['a', 'b', 3 as unknown as string],
      }),
    ).toEqual({ text: 'Lista', bullets: ['a', 'b'] });
    expect(
      normalizeAssistantWebhookReply({
        text: 'X',
        items: ['uno', 'dos'],
      }).bullets,
    ).toEqual(['uno', 'dos']);
  });

  it('usa el primer elemento si el payload es un array', () => {
    expect(
      normalizeAssistantWebhookReply([{ text: 'Primero' }, { text: 'Segundo' }]),
    ).toEqual({ text: 'Primero' });
  });

  it('si no hay texto string, devuelve mensaje de ayuda', () => {
    expect(normalizeAssistantWebhookReply({ text: 123 }).text).toContain(
      'no envió un texto principal',
    );
  });

  it('formato desconocido', () => {
    expect(normalizeAssistantWebhookReply(null).text).toContain('formato');
    expect(normalizeAssistantWebhookReply(42).text).toContain('formato');
  });
});

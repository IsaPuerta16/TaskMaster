import { buildConversationTitleFromMessage } from './conversation-title.util';

describe('buildConversationTitleFromMessage', () => {
  it('extrae palabras clave y omite stopwords', () => {
    expect(
      buildConversationTitleFromMessage(
        'Ayúdame a organizar mis tareas de matemáticas para esta semana',
      ),
    ).toBe('Organiz...');
  });

  it('trunca títulos largos', () => {
    const title = buildConversationTitleFromMessage(
      'planificar proyecto investigación universidad entrega final documentación completa',
    );
    expect(title.length).toBeLessThanOrEqual(48);
    expect(title.endsWith('...')).toBe(true);
  });

  it('usa el mensaje si no quedan palabras clave', () => {
    expect(buildConversationTitleFromMessage('de la el')).toBe('De la el');
    expect(buildConversationTitleFromMessage('de la el').length).toBeLessThanOrEqual(10);
  });
});

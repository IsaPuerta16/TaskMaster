export interface AssistantWebhookReply {
  text: string;
  bullets?: string[];
}

/**
 * Interpreta el JSON (u otro formato) que devuelve n8n en Respond to Webhook.
 * Cubierto por pruebas unitarias; no requiere llamar al webhook real.
 */
export function normalizeAssistantWebhookReply(
  payload: unknown,
): AssistantWebhookReply {
  if (typeof payload === 'string') {
    return { text: payload };
  }

  if (Array.isArray(payload)) {
    const first = payload[0];
    return normalizeAssistantWebhookReply(
      first ?? 'n8n no devolvió respuesta.',
    );
  }

  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    const textCandidate =
      data['text'] ??
      data['message'] ??
      data['reply'] ??
      data['output'] ??
      data['response'];
    const bulletsCandidate = data['bullets'] ?? data['items'] ?? data['steps'];

    const text =
      typeof textCandidate === 'string'
        ? textCandidate
        : 'n8n respondió, pero no envió un texto principal.';

    const bullets = Array.isArray(bulletsCandidate)
      ? bulletsCandidate.filter((item): item is string => typeof item === 'string')
      : undefined;

    return {
      text,
      bullets: bullets?.length ? bullets : undefined,
    };
  }

  return {
    text: 'n8n respondió con un formato que el frontend todavía no reconoce.',
  };
}

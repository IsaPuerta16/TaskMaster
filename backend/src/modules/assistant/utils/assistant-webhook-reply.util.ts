export interface TaskAction {
  type: 'create_task' | 'update_task';
  title?: string;
  dueDate?: string;
  priority?: string;
  description?: string;
  taskId?: string;
  status?: string;
}

export interface AssistantWebhookReply {
  text: string;
  bullets?: string[];
  actions?: TaskAction[];
}


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

    const actions = Array.isArray(data['actions'])
      ? (data['actions'] as unknown[]).filter(
          (a): a is TaskAction =>
            a !== null && typeof a === 'object' && 'type' in (a as object),
        )
      : undefined;

    return {
      text,
      bullets: bullets?.length ? bullets : undefined,
      actions: actions?.length ? actions : undefined,
    };
  }

  return {
    text: 'n8n respondió con un formato que el frontend todavía no reconoce.',
  };
}

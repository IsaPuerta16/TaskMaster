import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AssistantService } from './assistant.service';
import { environment } from '@env/environment';

describe('AssistantService', () => {
  let service: AssistantService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AssistantService],
    });
    service = TestBed.inject(AssistantService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getConversations: GET /assistant/conversations', (done) => {
    service.getConversations().subscribe((list) => {
      expect(list.length).toBe(1);
      expect(list[0].label).toBe('Una charla');
      done();
    });
    const req = http.expectOne(`${environment.apiUrl}/assistant/conversations`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'c1', label: 'Una charla' }]);
  });

  it('createConversation: POST /assistant/conversations', (done) => {
    service.createConversation().subscribe((conversation) => {
      expect(conversation.id).toBe('c2');
      expect(conversation.label).toBe('Nuevo chat');
      done();
    });
    const req = http.expectOne(`${environment.apiUrl}/assistant/conversations`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ id: 'c2', label: 'Nuevo chat' });
  });

  it('getConversationMessages: normaliza content y created_at', (done) => {
    service.getConversationMessages('c1').subscribe((detail) => {
      expect(detail.messages.length).toBe(1);
      expect(detail.messages[0].role).toBe('user');
      expect(detail.messages[0].text).toBe('hola');
      expect(detail.messages[0].createdAt).toBe('2026-04-01T12:00:00Z');
      done();
    });
    const url = `${environment.apiUrl}/assistant/conversations/c1/messages`;
    const req = http.expectOne(url);
    req.flush({
      id: 'c1',
      label: 'X',
      messages: [
        {
          role: 'user',
          content: 'hola',
          created_at: '2026-04-01T12:00:00Z',
        },
      ],
    });
  });

  it('sendMessage: POST /assistant/chat', (done) => {
    service
      .sendMessage({ message: 'test', conversationId: 'c1' })
      .subscribe((res) => {
        expect(res.conversation.id).toBe('c1');
        expect(res.assistantMessage.text).toBe('ok');
        done();
      });
    const req = http.expectOne(`${environment.apiUrl}/assistant/chat`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      message: 'test',
      conversationId: 'c1',
    });
    req.flush({
      conversation: { id: 'c1', label: 'L' },
      userMessage: { role: 'user', text: 'test' },
      assistantMessage: { role: 'assistant', text: 'ok' },
    });
  });

  it('deleteConversation: DELETE /assistant/conversations/:id', (done) => {
    service.deleteConversation('c1').subscribe((res) => {
      expect(res.message).toBe('Conversacion eliminada');
      done();
    });
    const req = http.expectOne(`${environment.apiUrl}/assistant/conversations/c1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Conversacion eliminada' });
  });
});

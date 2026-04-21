import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/api/axios';

interface Message {
  role: 'USER' | 'ASSISTANT';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (content: string) => {
      const resp = await api.post('/ai/chat', { 
        content, 
        conversationId: conversationId || undefined 
      });
      return resp.data;
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'ASSISTANT', content: data.response }]);
      setConversationId(data.conversationId);
    },
  });

  const handleSend = () => {
    if (!input.trim() || isPending) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'USER', content: userMsg }]);
    setInput('');
    mutate(userMsg);
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      {/* Chat Window */}
      {isOpen && (
        <div className="glass card animate-fade-in" style={{ 
          width: '380px', 
          height: '550px', 
          marginBottom: '1rem', 
          display: 'flex', 
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Header */}
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--primary)', color: 'white' }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '1.25rem' }}>🤖</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Asistente IA Premium</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Consultas en tiempo real</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.25rem' }}>×</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👋</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  ¡Hola! Soy tu asistente inteligente. Puedes preguntarme sobre tus propiedades, inquilinos o incluso pedirme que registre un pago.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button onClick={() => setInput('¿Cuáles son mis propiedades?')} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>¿Cuáles son mis propiedades?</button>
                  <button onClick={() => setInput('¿Cuánto gané este mes?')} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>¿Cuánto gané este mes?</button>
                </div>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} style={{ 
                alignSelf: m.role === 'USER' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '0.75rem 1rem',
                borderRadius: m.role === 'USER' ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                backgroundColor: m.role === 'USER' ? 'var(--primary)' : 'var(--bg-surface)',
                color: m.role === 'USER' ? 'white' : 'var(--text-main)',
                fontSize: '0.875rem',
                boxShadow: 'var(--shadow-sm)',
                whiteSpace: 'pre-wrap'
              }}>
                {m.content}
              </div>
            ))}
            
            {isPending && (
              <div style={{ 
                alignSelf: 'flex-start',
                padding: '0.75rem 1rem',
                borderRadius: '1rem 1rem 1rem 0',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-muted)',
                fontSize: '0.875rem'
              }}>
                IA pensando...
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe un mensaje..."
              style={{ 
                flex: 1, 
                border: '1px solid var(--border)', 
                borderRadius: '2rem', 
                padding: '0.6rem 1.25rem',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
            <button 
              onClick={handleSend}
              disabled={isPending || !input.trim()}
              className="btn btn-primary" 
              style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
            >
              🚀
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary"
        style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          fontSize: '1.5rem', 
          boxShadow: 'var(--shadow-lg)',
          display: 'grid',
          placeItems: 'center'
        }}
      >
        {isOpen ? '×' : '🤖'}
      </button>
    </div>
  );
}

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ChatMessage } from '../../types/models';

export interface ExportPDFParams {
  title: string;
  messages: ChatMessage[];
  bookTitle?: string;
  chapterTitle?: string;
  userName?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function markdownToHtml(md: string): string {
  let html = escapeHtml(md);

  // Code blocks: ```ts ... ```
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    return `<div class="code-box"><div class="code-header">${lang ? lang.toUpperCase() : 'CODE'}</div><pre><code>${code.trim()}</code></pre></div>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h4 class="md-h3">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="md-h2">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="md-h1">$1</h2>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote class="md-quote">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Bullet items
  html = html.replace(/^[-*•] (.*$)/gim, '<li class="md-li">$1</li>');

  // Newlines to br (outside pre)
  const parts = html.split(/(<div class="code-box">[\s\S]*?<\/div>)/g);
  return parts
    .map((part) => {
      if (part.startsWith('<div class="code-box">')) return part;
      return part.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');
    })
    .join('');
}

export async function exportConversationToPDF(params: ExportPDFParams): Promise<{
  success: boolean;
  uri?: string;
  error?: string;
}> {
  try {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const messagesHtml = params.messages
      .map((msg) => {
        const isUser = msg.sender === 'user';
        const senderLabel = isUser ? (params.userName || 'Reader') : 'GoalBook AI Assistant';
        const avatarBg = isUser ? '#2563EB' : '#FBBF24';
        const avatarColor = isUser ? '#FFFFFF' : '#0B0F19';
        const initial = isUser ? 'U' : '✨';
        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let passageHtml = '';
        if (msg.selectedPassage) {
          passageHtml = `
            <div class="passage-callout">
              <span class="passage-tag">REFERENCED EXCERPT:</span>
              <div class="passage-text">"${escapeHtml(msg.selectedPassage)}"</div>
            </div>
          `;
        }

        let attachmentsHtml = '';
        if (msg.attachments && msg.attachments.length > 0) {
          attachmentsHtml = `
            <div class="attachments-list">
              ${msg.attachments
                .map(
                  (att) => `
                  <div class="attachment-item">
                    <span class="att-icon">📎</span>
                    <span class="att-name">${escapeHtml(att.name)}</span>
                    <span class="att-type">${att.type.toUpperCase()}</span>
                  </div>
                `
                )
                .join('')}
            </div>
          `;
        }

        const bodyHtml = markdownToHtml(msg.content);

        return `
          <div class="message-card ${isUser ? 'user-card' : 'ai-card'}">
            <div class="card-header">
              <div class="avatar" style="background-color: ${avatarBg}; color: ${avatarColor};">
                ${initial}
              </div>
              <div class="header-meta">
                <span class="sender-name">${senderLabel}</span>
                <span class="msg-time">${time}</span>
              </div>
              ${msg.referencedPage ? `<span class="page-pill">Page ${msg.referencedPage}</span>` : ''}
            </div>
            ${passageHtml}
            ${attachmentsHtml}
            <div class="card-body">
              ${bodyHtml}
            </div>
          </div>
        `;
      })
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(params.title)} - GoalBook AI</title>
          <style>
            @page {
              margin: 18mm 16mm 18mm 16mm;
              size: A4 portrait;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0F172A;
              background-color: #FFFFFF;
              line-height: 1.5;
              padding: 0;
              margin: 0;
            }
            .header {
              border-bottom: 2px solid #E2E8F0;
              padding-bottom: 14px;
              margin-bottom: 22px;
            }
            .brand-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .brand-logo {
              font-size: 20px;
              font-weight: 800;
              color: #2563EB;
              letter-spacing: -0.5px;
            }
            .badge {
              background: #EEF2FF;
              color: #4338CA;
              font-size: 11px;
              font-weight: 700;
              padding: 4px 10px;
              border-radius: 999px;
              text-transform: uppercase;
            }
            .conv-title {
              font-size: 20px;
              font-weight: 700;
              color: #0F172A;
              margin: 0 0 6px 0;
            }
            .context-row {
              font-size: 12px;
              color: #64748B;
              display: flex;
              gap: 16px;
              flex-wrap: wrap;
            }
            .context-item {
              display: inline-block;
            }
            .context-item strong {
              color: #334155;
            }
            .message-card {
              border-radius: 12px;
              padding: 14px 18px;
              margin-bottom: 16px;
              page-break-inside: avoid;
            }
            .user-card {
              background-color: #F8FAFC;
              border: 1px solid #E2E8F0;
              border-left: 4px solid #2563EB;
            }
            .ai-card {
              background-color: #F1F5F9;
              border: 1px solid #CBD5E1;
              border-left: 4px solid #F59E0B;
            }
            .card-header {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 8px;
            }
            .avatar {
              width: 26px;
              height: 26px;
              border-radius: 13px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 13px;
            }
            .header-meta {
              flex: 1;
            }
            .sender-name {
              font-size: 13px;
              font-weight: 700;
              color: #1E293B;
              margin-right: 8px;
            }
            .msg-time {
              font-size: 11px;
              color: #94A3B8;
            }
            .page-pill {
              font-size: 10px;
              font-weight: 600;
              background: #E2E8F0;
              color: #475569;
              padding: 2px 8px;
              border-radius: 6px;
            }
            .passage-callout {
              background-color: #FEF3C7;
              border-left: 3px solid #D97706;
              padding: 8px 12px;
              border-radius: 6px;
              margin: 8px 0;
            }
            .passage-tag {
              font-size: 9px;
              font-weight: 800;
              color: #B45309;
              display: block;
              margin-bottom: 2px;
              letter-spacing: 0.5px;
            }
            .passage-text {
              font-size: 12px;
              color: #78350F;
              font-style: italic;
            }
            .attachments-list {
              margin: 6px 0;
            }
            .attachment-item {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              background: #E2E8F0;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 11px;
              color: #334155;
              margin-right: 6px;
            }
            .att-type {
              font-size: 9px;
              background: #CBD5E1;
              padding: 2px 5px;
              border-radius: 4px;
              font-weight: bold;
            }
            .card-body {
              font-size: 13px;
              color: #1E293B;
              line-height: 1.6;
            }
            .md-h1, .md-h2, .md-h3 {
              color: #0F172A;
              margin: 10px 0 4px 0;
            }
            .md-h1 { font-size: 16px; }
            .md-h2 { font-size: 15px; }
            .md-h3 { font-size: 14px; }
            .md-quote {
              border-left: 3px solid #94A3B8;
              padding-left: 10px;
              margin: 8px 0;
              color: #475569;
              font-style: italic;
            }
            .md-li {
              margin-left: 18px;
              margin-bottom: 3px;
            }
            .inline-code {
              background: #E2E8F0;
              color: #BE185D;
              padding: 1px 5px;
              border-radius: 4px;
              font-family: monospace;
              font-size: 12px;
            }
            .code-box {
              background: #0F172A;
              border-radius: 8px;
              margin: 10px 0;
              overflow: hidden;
            }
            .code-header {
              background: #1E293B;
              color: #94A3B8;
              font-size: 10px;
              font-weight: 700;
              padding: 4px 10px;
              letter-spacing: 0.5px;
            }
            pre {
              margin: 0;
              padding: 10px;
              overflow-x: auto;
            }
            pre code {
              color: #38BDF8;
              font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
              font-size: 11px;
            }
            .footer {
              margin-top: 30px;
              border-top: 1px solid #E2E8F0;
              padding-top: 10px;
              text-align: center;
              font-size: 10px;
              color: #94A3B8;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand-row">
              <div class="brand-logo">GoalBook AI</div>
              <span class="badge">Reading Assistant Transcript</span>
            </div>
            <h1 class="conv-title">${escapeHtml(params.title)}</h1>
            <div class="context-row">
              ${params.bookTitle ? `<span class="context-item"><strong>Book:</strong> ${escapeHtml(params.bookTitle)}</span>` : ''}
              ${params.chapterTitle ? `<span class="context-item"><strong>Section:</strong> ${escapeHtml(params.chapterTitle)}</span>` : ''}
              <span class="context-item"><strong>Exported:</strong> ${formattedDate}</span>
              <span class="context-item"><strong>Messages:</strong> ${params.messages.length}</span>
            </div>
          </div>

          <div class="messages-container">
            ${messagesHtml}
          </div>

          <div class="footer">
            Generated with GoalBook AI · Personalized Reading Intelligence & Comprehension System
          </div>
        </body>
      </html>
    `;

    const file = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(file.uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Export: ${params.title}`,
      });
    }

    return {
      success: true,
      uri: file.uri,
    };
  } catch (error: any) {
    console.error('[PDF Export] Error generating conversation PDF:', error);
    return {
      success: false,
      error: error?.message || 'Failed to generate PDF.',
    };
  }
}

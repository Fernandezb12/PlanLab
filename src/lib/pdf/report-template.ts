export const buildReportHtml = (title: string, body: string) => `
  <html>
    <body style="font-family: Inter, sans-serif; padding: 32px;">
      <h1>${title}</h1>
      <p>${body}</p>
    </body>
  </html>
`;

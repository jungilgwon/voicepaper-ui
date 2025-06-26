// pdf-parse.d.ts
// pdf-parse 모듈의 최소 타입 선언

declare module 'pdf-parse' {
  function pdfParse(
    dataBuffer: Buffer,
    options?: any
  ): Promise<{ text: string }>;
  export = pdfParse;
} 
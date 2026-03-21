export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'txt':
    case 'md':
    case 'csv':
      return await file.text();
      
    case 'pdf':
      return await extractTextFromPDF(file);
      
    case 'docx':
      return await extractTextFromDocx(file);
      
    default:
      throw new Error(`Unsupported file type: .${extension}`);
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  // Dynamically import pdfjs-dist to avoid SSR DOMMatrix ReferenceError
  const pdfjsLib = await import('pdfjs-dist');
  
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText;
}

async function extractTextFromDocx(file: File): Promise<string> {
  // Dynamically import mammoth to avoid SSR issues
  const mammoth = (await import('mammoth')).default;
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || '';
}

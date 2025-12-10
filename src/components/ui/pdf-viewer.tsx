function PDFViewer({
  src,
  height,
  title,
}: {
  src: string;
  height?: string | number;
  title?: string;
}) {
  return (
    <div style={{ height: height || "800px" }}>
      <object data={src} type="application/pdf" width="100%" height="100%">
        <iframe src={src} width="100%" height="100%" title={title}>
          This browser does not support PDFs. Please download the PDF to view
          it.
        </iframe>
      </object>
    </div>
  );
}

export default  PDFViewer;
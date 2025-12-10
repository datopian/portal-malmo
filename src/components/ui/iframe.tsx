function IframeWrapper({
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
      <iframe src={src} width="100%" height="100%" title={title}>
        This browser does not support PDFs. Please download the PDF to view it.
      </iframe>
    </div>
  );
}

export default IframeWrapper;

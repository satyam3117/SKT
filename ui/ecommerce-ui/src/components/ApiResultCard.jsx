function ApiResultCard({ title, value }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const textValue = typeof value === "string" ? value : JSON.stringify(value, null, 2);

  return (
    <section className="result-card">
      <h3>{title}</h3>
      <pre>{textValue}</pre>
    </section>
  );
}

export default ApiResultCard;


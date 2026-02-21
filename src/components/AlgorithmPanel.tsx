interface AlgorithmPanelProps {
  lines: string[];
}

function tokenClass(token: string): string | null {
  const normalized = token.toLowerCase();
  if (normalized === "sarı" || normalized === "sari") return "yellow";
  if (normalized === "yeşil" || normalized === "yesil") return "green";
  if (normalized === "mavi") return "blue";
  return null;
}

function renderLine(line: string) {
  const tokens = line.split(/(sarı|sari|yeşil|yesil|mavi)/gi);
  return tokens.map((token, index) => {
    const color = tokenClass(token);
    if (!color) {
      return <span key={`${token}-${index}`}>{token}</span>;
    }

    return <span className={`algo-color ${color}`} key={`${token}-${index}`} aria-label={token} />;
  });
}

export function AlgorithmPanel({ lines }: AlgorithmPanelProps) {
  return (
    <section className="panel panel--algorithm" aria-label="Algoritma">
      <h3>Algoritma</h3>
      <div className="algorithm-lines">
        {lines.map((line, index) => (
          <p key={`${line}-${index}`}>{renderLine(line)}</p>
        ))}
      </div>
    </section>
  );
}

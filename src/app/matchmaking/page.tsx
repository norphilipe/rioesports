const games = [
  { name: "Counter-Strike 2", mode: "Competitivo 5v5", status: "Em desenvolvimento" },
  { name: "League of Legends", mode: "Ranqueada 5v5", status: "Em desenvolvimento" },
  { name: "Valorant", mode: "Competitivo 5v5", status: "Em desenvolvimento" },
];

export default function MatchmakingPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "48px 24px", background: "#08090c", color: "#f5f7fa" }}>
      <section style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ color: "#ff7a00", fontWeight: 700, letterSpacing: "0.12em" }}>RIO ESPORTS</p>
        <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", margin: "12px 0" }}>MATCHMAKING</h1>
        <p style={{ maxWidth: 680, color: "#a8b0bb", fontSize: "1.1rem", lineHeight: 1.6 }}>
          Encontre jogadores, entre em uma fila competitiva e dispute partidas pelo ecossistema de esports do Rio de Janeiro.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18, marginTop: 40 }}>
          {games.map((game) => (
            <article key={game.name} style={{ border: "1px solid #252932", borderRadius: 16, padding: 24, background: "#111318" }}>
              <p style={{ color: "#ff7a00", fontSize: "0.8rem", fontWeight: 700 }}>{game.status.toUpperCase()}</p>
              <h2 style={{ margin: "12px 0 8px" }}>{game.name}</h2>
              <p style={{ color: "#a8b0bb" }}>{game.mode}</p>
              <button disabled style={{ marginTop: 18, width: "100%", padding: "12px 16px", borderRadius: 10, border: 0, cursor: "not-allowed" }}>
                Entrar na fila em breve
              </button>
            </article>
          ))}
        </div>

        <section style={{ marginTop: 48, padding: 24, borderLeft: "3px solid #ff7a00", background: "#111318" }}>
          <h2>O que está sendo construído agora?</h2>
          <p style={{ color: "#a8b0bb", lineHeight: 1.6 }}>
            Perfis por jogo, modos competitivos, filas protegidas e formação transacional de partidas. A interface será conectada ao backend à medida que as PRs de fundação forem consolidadas.
          </p>
        </section>
      </section>
    </main>
  );
}

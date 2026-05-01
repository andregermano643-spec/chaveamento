type Props = {
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  logo1?: string | null;
  logo2?: string | null;
};

export default function MatchCard({
  team1,
  team2,
  score1,
  score2,
  logo1,
  logo2,
}: Props) {
  return (
    <div className="match-card">
      <div className="team-row">
        <div className="team-info">
          {logo1 && <img src={logo1} className="team-logo" alt={team1} />}
          <span>{team1}</span>
        </div>
        <span className="score">{score1}</span>
      </div>

      <div className="team-row">
        <div className="team-info">
          {logo2 && <img src={logo2} className="team-logo" alt={team2} />}
          <span>{team2}</span>
        </div>
        <span className="score">{score2}</span>
      </div>
    </div>
  );
}
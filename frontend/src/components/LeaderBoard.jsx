/* eslint-disable react/prop-types */
const LeaderBoard = ({ leaders }) => {
  return (
    <div>
      <div className="leader"> Leader Board </div>
      <section>
        {leaders &&
          leaders.map((leader, leaderIndx) => {
            const { name, wins } = leader;
            const place = leaderIndx + 1;
            return (
              <div className="leader" key={`leader-${leaderIndx}`}>
                {place} {` : `} {name}: {wins}
              </div>
            );
          })}
      </section>
    </div>
  );
};
export default LeaderBoard;

/* eslint-disable react/prop-types */
/**
 * @Author: Javier Olaya
 * @fileName: History.jsx
 * @date: 6/18/2021
 * @description: displays all the games played
 */

/**
 *
 * @param {array} { leaders }
 * @return {html}
 */
const History = ({ history }) => {
    console.log("history", history)
  return (
    <div>
      <div className="leader"> History Board </div>
      <div className="leader"> Winner - Loser </div>
      <section>
        {history &&
          history.map((historyRec, leaderIndx) => {
            const { winnerId, loserId } = historyRec;
            return (
              <div className="leader" key={`history-rec-${leaderIndx}`}>
                {winnerId} {` : `} {loserId}
              </div>
            );
          })}
      </section>
    </div>
  );
};
export default History;

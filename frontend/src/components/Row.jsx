/* eslint-disable react/prop-types */

import Column from './Column';

const Row = ({ gridRow, rowIndex }) => {
  return (
    <div className="roww">
      {gridRow && gridRow.map((row,rowIndx)=>{
        return (<Column letter={row[rowIndex][rowIndx]} />)
      });
      }
      <Column letter={gridRow[rowIndex][1]} />
      <Column letter={gridRow[rowIndex][3]} />
    </div>
  );
};
export default Row;

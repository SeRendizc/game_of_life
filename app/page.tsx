"use client";

import React, { useState, useEffect, useCallback } from 'react';

const numRows = 40;
const numCols = 80;

const operations = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1]
];

const generateEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }
  return rows;
};

const GameOfLife = () => {
  const [grid, setGrid] = useState(() => generateEmptyGrid());
  const [running, setRunning] = useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const runSimulation = useCallback(() => {
    if (!running) {
      return;
    }

    setGrid(g => {
      return g.map((row, i) =>
        row.map((col, k) => {
          let neighbors = 0;
          operations.forEach(([x, y]) => {
            const newI = i + x;
            const newK = k + y;
            if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
              neighbors += g[newI][newK];
            }
          });

          if (neighbors < 2 || neighbors > 3) {
            return 0;
          } else if (g[i][k] === 0 && neighbors === 3) {
            return 1;
          } else {
            return g[i][k];
          }
        })
      );
    });

    timeoutRef.current = setTimeout(runSimulation, 100);
  }, [running]);

  useEffect(() => {
    if (running) {
      runSimulation();
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [running, runSimulation]);

  return (
    <> 
      <button onClick={() => {
        setRunning(!running);
      }}>
        {running ? '停止' : '开始'}
      </button>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${numCols}, 15px)`
      }}>
        {grid.map((rows, i) =>
          rows.map((col, k) => (
            <div
              key={`${i}-${k}`}
              onClick={() => {
                const newGrid = [...grid];
                newGrid[i][k] = 1 - grid[i][k];
                setGrid(newGrid);
              }}
              style={{
                width: 15,
                height: 15,
                backgroundColor: grid[i][k] ? 'black' : undefined,
                border: 'solid 1px gray'
              }}
            />
          ))
        )}
      </div>
    </>
  );
};

export default GameOfLife;
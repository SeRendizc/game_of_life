"use client";

import React, { useState, useEffect, useCallback } from 'react';

const numRows = 50;
const numCols = 100;

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
  const [speed, setSpeed] = useState(1);
  const [customSpeed, setCustomSpeed] = useState('');
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

    timeoutRef.current = setTimeout(runSimulation, 100 / speed);
  }, [running, speed]);

  useEffect(() => {
    const clearTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    
    if (running) {
      runSimulation();
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [running, runSimulation]);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setSpeed(Number(customSpeed) || 1);
    } else {
      setSpeed(Number(value));
      setCustomSpeed('');
    }
  };

  const handleCustomSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomSpeed(value);
    if (value) {
      setSpeed(Number(value));
    }
  };

  return (
    <> 
      <button onClick={() => {
        setRunning(!running);
      }}>
        {running ? '停止' : '开始'}
      </button>
      <div>
        <label htmlFor="speed">速度:</label>
        <select
          id="speed"
          value={customSpeed ? 'custom' : speed}
          onChange={handleSpeedChange}
        >
          <option value={0.25}>0.25x</option>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
          <option value={8}>8x</option>
          <option value={16}>16x</option>
          <option value={32}>32x</option>
          <option value={64}>64x</option>
          <option value={128}>128x</option>
          <option value="custom">自定义</option>
        </select>
        {customSpeed !== '' && (
          <input
            type="number"
            value={customSpeed}
            onChange={handleCustomSpeedChange}
            placeholder="输入自定义速度"
          />
        )}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${numCols}, 10px)`
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
                width: 10,
                height: 10,
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
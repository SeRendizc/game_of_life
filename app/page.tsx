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
  const [generation, setGeneration] = useState(0);
  const [aliveCells, setAliveCells] = useState(0);
  const [previousAliveCounts, setPreviousAliveCounts] = useState<number[]>([]);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const buttonStyle = {
    borderRadius: '5px',
    padding: '5px 10px',
    transition: 'background-color 0.3s',
    cursor: 'pointer'
  };

  const updateGrid = (grid: number[][]) => {
    let newAliveCells = 0;
    const newGrid = grid.map((row, i) =>
      row.map((col, k) => {
        let neighbors = 0;
        operations.forEach(([x, y]) => {
          const newI = i + x;
          const newK = k + y;
          if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
            neighbors += grid[newI][newK];
          }
        });

        if (neighbors < 2 || neighbors > 3) {
          return 0;
        } else if (grid[i][k] === 0 && neighbors === 3) {
          newAliveCells++;
          return 1;
        } else {
          if (grid[i][k] === 1) newAliveCells++;
          return grid[i][k];
        }
      })
    );
    setAliveCells(newAliveCells);
    return newGrid;
  };

  const runSimulation = useCallback(() => {
    if (!running) {
      return;
    }

    setGrid(g => updateGrid(g));
    setGeneration(gen => gen + 1);

    setPreviousAliveCounts(prev => {
      const newCounts = [...prev, aliveCells];
      if (newCounts.length > 4) {
        newCounts.shift();
      }
      return newCounts;
    });

    if (previousAliveCounts.length === 4 && previousAliveCounts.every(count => count === aliveCells)) {
      setRunning(false);
      alert('已无存活细胞更新，自动暂停模拟！');
      return;
    }

    timeoutRef.current = setTimeout(runSimulation, 600 / speed);
  }, [running, speed, aliveCells, previousAliveCounts]);

  const singleSimulation = () => {
    setGrid(g => updateGrid(g));
    setGeneration(gen => gen + 1);
  };

  const randomizeGrid = () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0)));
    }
    setGrid(rows);
    setGeneration(0);
    setAliveCells(rows.flat().reduce<number>((acc, cell) => acc + cell, 0));
    setPreviousAliveCounts([]);
  };

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setRunning(r => !r);
      } else if (e.key === 's') {
        singleSimulation();
      } else if (e.key === 'r') {
        resetGame();
      } else if (e.key === 'g') {
        randomizeGrid();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setCustomSpeed(customSpeed || '1');
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

  const resetGame = () => {
    setGrid(generateEmptyGrid());
    setGeneration(0);
    setAliveCells(0);
    setRunning(false);
    setPreviousAliveCounts([]);
  };

  return (
    <>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '10px', 
        padding: '10px', 
        border: '1px solid #ccc', 
        borderRadius: '10px' 
      }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 'bold', fontSize: '24px' }}>生命游戏 Game of Life</h1>
        </div>
        <div>
          <span>v0.2</span>
        </div>
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '10px', 
        padding: '10px', 
        border: '1px solid #ccc', 
        borderRadius: '10px' 
      }}>
        <button 
          onClick={() => {
            setRunning(!running);
          }} 
          style={buttonStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ddd'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
        >
          {running ? '暂停迭代 (Space)' : '自动迭代 (Space)'}
        </button>
        <button 
          onClick={singleSimulation} 
          style={buttonStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ddd'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
        >
          单次迭代 (S)
        </button>
        <button 
          onClick={resetGame} 
          style={buttonStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ddd'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
        >
          重置状态 (R)
        </button>
        <button 
          onClick={randomizeGrid} 
          style={buttonStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ddd'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
        >
          随机生成 (G)
        </button>
        <div>
          <label htmlFor="speed">速度:</label>
          <select
            id="speed"
            value={customSpeed ? 'custom' : speed}
            onChange={handleSpeedChange}
            style={{ borderRadius: '5px', padding: '5px' }}
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
            <option value={256}>256x</option>
            <option value={512}>512x</option>
            <option value="custom">自定义</option>
          </select>
          {customSpeed && (
            <input
              type="number"
              value={customSpeed}
              onChange={handleCustomSpeedChange}
              placeholder="输入自定义速度"
              style={{ borderRadius: '4px', padding: '4px', marginLeft: '4px' }}
            />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>代数: </span>
          <span style={{ minWidth: '30px', textAlign: 'right' }}>{generation}</span>
          <span style={{ margin: '0 10px' }}>|</span>
          <span>存活细胞: </span>
          <span style={{ minWidth: '38px', textAlign: 'right' }}>{aliveCells}</span>
        </div>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${numCols}, 10px)`,
          border: '2px solid #ccc',
          borderRadius: '10px',
          padding: '10px'
        }}>
          {grid.map((rows, i) =>
            rows.map((col, k) => (
              <div
                key={`${i}-${k}`}
                onClick={() => {
                  const newGrid = [...grid];
                  newGrid[i][k] = 1 - grid[i][k];
                  setGrid(newGrid);
                  setAliveCells(aliveCells + (newGrid[i][k] ? 1 : -1));
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
      </div>
    </>
  );
};

export default GameOfLife;
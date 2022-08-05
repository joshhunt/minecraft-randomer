import React, {
  CSSProperties,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";
import "./App.css";

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const COLORS = [
  "#f6e58d",
  "#ff7979",
  "#badc58",
  "#7ed6df",
  "#e056fd",
  "#686de0",
  "#30336b",
  "#95afc0",
  "#f9ca24",
  "#f0932b",
  "#eb4d4b",
  "#6ab04c",
  "#22a6b3",
  "#be2edd",
  "#4834d4",
];

const randomShiftBy = getRandomInt(0, COLORS.length);

for (let index = 0; index < randomShiftBy; index++) {
  COLORS.push(COLORS.shift() ?? "");
}

const blockImageContext = require.context("./block-images/", false);
const validBlockPaths = blockImageContext.keys();

function App() {
  const widthId = useId();
  const heightId = useId();
  const blocksId = useId();
  const searchId = useId();

  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(5);
  const [blocks, setBlocks] = useState<string[]>([
    "log_spruce",
    "log_spruce_top",
    "planks_spruce",
    "stripped_spruce_log",
  ]);
  const [searchText, setSearchText] = useState<string>("");

  const searchFilteredBlocks = useMemo(() => {
    if (searchText.length === 0) {
      return validBlockPaths;
    }
    const searchFilter = searchText.toLowerCase();
    const searchFilterb = searchFilter.replace(/\s+/g, "_");

    return validBlockPaths.filter((v) => {
      const lower = v.toLowerCase();

      return lower.includes(searchFilter) || lower.includes(searchFilterb);
    });
  }, [searchText]);

  const handleWidthChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setWidth(parseInt(ev.target.value) || 1);
    },
    []
  );

  const handleSearchChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(ev.target.value);
    },
    []
  );

  const handleHeightChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setHeight(parseInt(ev.target.value) || 1);
    },
    []
  );

  const handleBlocksChange = useCallback(
    (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
      setBlocks(ev.target.value.split("\n").map((v) => v.trim()));
    },
    []
  );

  const randomBlocks = useMemo(() => {
    const render: string[][] = [];

    for (let widthIndex = 0; widthIndex < width; widthIndex++) {
      const row: string[] = [];

      for (let heightIndex = 0; heightIndex < height; heightIndex++) {
        const randomBlock = blocks[Math.floor(Math.random() * blocks.length)];
        row.push(randomBlock);
      }

      render.push(row);
    }

    return render;
  }, [width, height, blocks]);

  const addSearchResultToBlocks = useCallback((imageImportPath: string) => {
    const match = imageImportPath.match(/\.\/(.*).png/);
    if (match) {
      setBlocks((v) => [...v, match[1]]);
    }
  }, []);

  return (
    <div className="App">
      <div>
        <label htmlFor={widthId}>Width:</label>{" "}
        <input value={width} id={widthId} onChange={handleWidthChange} />
        <br />
        <label htmlFor={heightId}>Height:</label>{" "}
        <input value={height} id={heightId} onChange={handleHeightChange} />
        <br />
        <label htmlFor={blocksId}>Blocks (newline seperated):</label>
        <br />
        <textarea value={blocks.join("\n")} onChange={handleBlocksChange} />
      </div>

      <div
        className="block-grid"
        style={{
          ...cssVar("grid-columns", width.toString()),
          ...cssVar("grid-rows", height.toString()),
        }}
      >
        {randomBlocks.map((row, index) => {
          return (
            <div className="blocks-row" key={index}>
              {row.map((block, blockIndex) => {
                const blockColorIndex = blocks.indexOf(block);
                const blockColor = COLORS[blockColorIndex];
                const blockPath = `./${block}.png`;

                const blockImage = validBlockPaths.includes(blockPath)
                  ? blockImageContext(blockPath)
                  : undefined;

                return (
                  <div
                    className="block"
                    key={blockIndex}
                    style={{
                      backgroundImage: `url("${blockImage}")`,
                      backgroundColor: blockImage ? "transparent" : blockColor,
                    }}
                  >
                    <span className="block-name">
                      {block.replace(/_/g, " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div>
        <br />
        <br />
        <br />
        <label htmlFor={searchId}>Search:</label>{" "}
        <input value={searchText} id={searchId} onChange={handleSearchChange} />
        <br />
        <br />
        <div className="search-grid">
          {searchFilteredBlocks.map((v) => (
            <img
              key={v}
              alt={v}
              onClick={() => addSearchResultToBlocks(v)}
              className="search-image"
              src={blockImageContext(v)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function cssVar(name: string, value: string) {
  return { [`--${name}`]: value } as CSSProperties;
}

export default App;

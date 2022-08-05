import React, {
  CSSProperties,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";
import "./App.css";
import Select, { MultiValue } from "react-select";

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

interface BlockOption {
  label: string;
  value: string;
}

const blockOptions: BlockOption[] = validBlockPaths.map((blockPath) => {
  const blockId = blockPath.match(/\.\/(.*).png/)?.[1] ?? blockPath;

  const blockName = blockId.replace(/_/g, " ");

  return {
    value: blockPath,
    label: blockName,
  };
});

interface BlockConfig {
  blocks: BlockOption[];
  chance: string;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const initialBlockConfig = [
  {
    blocks: [
      {
        value: "./planks_spruce.png",
        label: "planks spruce",
      },
    ],
    chance: "",
  },
  {
    blocks: [
      {
        value: "./log_spruce.png",
        label: "log spruce",
      },
    ],
    chance: "",
  },
  {
    blocks: [
      {
        value: "./stripped_spruce_log.png",
        label: "stripped spruce log",
      },
    ],
    chance: "",
  },
  {
    blocks: [
      {
        value: "./spruce_trapdoor.png",
        label: "spruce trapdoor",
      },
    ],
    chance: "",
  },
  {
    blocks: [
      {
        value: "./log_spruce_top.png",
        label: "log spruce top",
      },
    ],
    chance: "",
  },
  {
    blocks: [],
    chance: "",
  },
];

function App() {
  const widthId = useId();
  const heightId = useId();

  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(5);
  const [blockConfig, setBlockConfig] =
    useState<BlockConfig[]>(initialBlockConfig);

  const [random, setRandom] = useState(0);

  const reRandom = () => {
    setRandom((v) => v + 1);
  };

  const handleWidthChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setWidth(parseInt(ev.target.value) || 1);
    },
    []
  );

  const handleHeightChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setHeight(parseInt(ev.target.value) || 1);
    },
    []
  );

  const { cleanedBlockConfig, autoChance } = useMemo(() => {
    let cleanedBlockConfig = blockConfig
      .map((v) => {
        const chance = parseInt(v.chance);

        return {
          blocks: v.blocks.filter(Boolean),
          chance: isNaN(chance) ? null : chance,
        };
      })
      .filter((v) => v.blocks.length);

    const assignedChance = cleanedBlockConfig.reduce(
      (acc, config) => acc + (config.chance || 0),
      0
    );

    const countOfAutoChance = cleanedBlockConfig.filter(
      (v) => v.chance === null
    ).length;

    const autoChance = Math.floor(
      Math.min(Math.max((100 - assignedChance) / countOfAutoChance, 0), 100)
    );

    return { cleanedBlockConfig, autoChance };
  }, [blockConfig]);

  const randomBlocks = useMemo(() => {
    console.log(random);
    const randomBlockOptions = cleanedBlockConfig.flatMap((blockConfig) => {
      const chance = blockConfig.chance || autoChance;
      const chancesForThisBlock: BlockOption[][] = new Array(
        Math.floor(chance)
      );
      chancesForThisBlock.fill(blockConfig.blocks);
      return chancesForThisBlock;
    });

    const render: BlockOption[][] = [];

    for (let widthIndex = 0; widthIndex < width; widthIndex++) {
      const row: BlockOption[] = [];

      for (let heightIndex = 0; heightIndex < height; heightIndex++) {
        const randomBlock = pick(pick(randomBlockOptions) ?? []);
        if (randomBlock) {
          row.push(randomBlock);
        }
      }

      if (row.length) {
        render.push(row);
      }
    }

    return render;
  }, [random, cleanedBlockConfig, autoChance, width, height]);

  const handleSelectedBlockChange = useCallback(
    (selection: MultiValue<BlockOption | undefined>, configIndex: number) => {
      setBlockConfig((v) => {
        const newConfig = [...v];

        newConfig[configIndex] = {
          blocks: selection.filter(Boolean) as BlockOption[],
          chance: v[configIndex].chance,
        };

        const hasEmptyConfig = newConfig.some((v) => v.blocks.length === 0);
        if (!hasEmptyConfig) {
          newConfig.push({ blocks: [], chance: "" });
        }

        return newConfig;
      });
    },
    []
  );

  const handleBlockChanceChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>, configIndex: number) => {
      setBlockConfig((v) => {
        const newConfig = [...v];

        newConfig[configIndex] = {
          blocks: v[configIndex].blocks,
          chance: ev.target.value,
        };

        return newConfig;
      });
    },
    []
  );

  return (
    <div className="App">
      <div>
        <label htmlFor={widthId}>Width:</label>{" "}
        <input value={width} id={widthId} onChange={handleWidthChange} />
        <br />
        <label htmlFor={heightId}>Height:</label>{" "}
        <input value={height} id={heightId} onChange={handleHeightChange} />
        <br />
        <div className="block-config-grid">
          <label>Blocks (newline seperated):</label>
          <div>Chance</div>
          <div />
          {blockConfig.map((bc, configIndex) => {
            const chancePlaceholder =
              bc.blocks.length > 0 ? `${autoChance}%` : "auto";

            return (
              <>
                <Select
                  className="block-select"
                  value={bc.blocks}
                  isMulti
                  options={blockOptions}
                  onChange={(ev) => handleSelectedBlockChange(ev, configIndex)}
                  formatOptionLabel={(option) => {
                    const blockImage = validBlockPaths.includes(option.value)
                      ? blockImageContext(option.value)
                      : undefined;

                    return (
                      <div className="block-select-option">
                        {blockImage && (
                          <img
                            alt=""
                            src={blockImage}
                            className="block-select-option-image"
                          />
                        )}
                        <span>{option.label}</span>
                      </div>
                    );
                  }}
                />
                <input
                  type="text"
                  value={bc.chance ?? ""}
                  placeholder={chancePlaceholder}
                  onChange={(ev) => handleBlockChanceChange(ev, configIndex)}
                />
                <div>
                  {bc.chance.length
                    ? bc.chance
                    : bc.blocks.length > 0 && autoChance}
                  %
                </div>
              </>
            );
          })}
        </div>
      </div>

      <button onClick={reRandom}>re-random</button>
      <br />
      <br />

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
                const blockImage = validBlockPaths.includes(block.value)
                  ? blockImageContext(block.value)
                  : undefined;

                return (
                  <div
                    className="block"
                    key={blockIndex}
                    style={{
                      backgroundImage: `url("${blockImage}")`,
                    }}
                  >
                    <span className="block-name">{block.label}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function cssVar(name: string, value: string) {
  return { [`--${name}`]: value } as CSSProperties;
}

export default App;

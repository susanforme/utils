import fs from 'fs-extra';
import path from 'path';
import postcss, { AcceptedPlugin } from 'postcss';
import less from 'postcss-less';
import scss from 'postcss-scss';
import { PxToRemOptions, postcssPxToRem } from '.';

const cssDir = path.join(__dirname, 'css');
const cacheDir = path.join(__dirname, 'cache');

const parsers: Record<string, any> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  '.less': less,
  '.scss': scss,
};

async function processFile(file: string, opts: PxToRemOptions, plugin: (options: PxToRemOptions) => AcceptedPlugin) {
  const ext = path.extname(file);
  const content = fs.readFileSync(file, 'utf8');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const parser: any = parsers[ext];

  const result = await postcss([plugin(opts)]).process(content, {
    from: file,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    parser,
  });

  const outputFileName = path.basename(file);
  const outputFile = path.join(cacheDir, outputFileName);
  await fs.outputFile(outputFile, result.css, 'utf8');
  console.log(`Processed: ${path.basename(file)} -> cache/${outputFileName}`);
}

async function main() {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  if (!fs.existsSync(cssDir)) {
    console.error(`Directory not found: ${cssDir}`);
    return;
  }

  const files = fs
    .readdirSync(cssDir)
    .filter((f) => Object.keys(parsers).concat('.css').includes(path.extname(f)))
    .map((f) => path.join(cssDir, f));

  for (const file of files) {
    await processFile(
      file,
      {
        replace: false,
      },
      postcssPxToRem,
    );
  }
}

void main();

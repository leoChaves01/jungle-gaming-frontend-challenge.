import fs from 'node:fs/promises';
import os from 'node:os';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';

import { chromium } from '@playwright/test';
const root = 'reports/lighthouse';
await fs.mkdir(root, { recursive: true });
const summary = {
  date: new Date().toISOString(),
  environment: {
    os: os.type() + ' ' + os.release(),
    cpu: os.cpus()[0].model,
    node: process.version,
    chrome: 'Playwright Chromium headless shell',
  },
  conditions:
    'Build de produção, MSW padrão, cache limpo por medição, throttling simulado padrão Lighthouse. Sem remoção de assets ou funcionalidades.',
  results: [],
};
for (const page of ['home', 'detail'])
  for (const profile of ['mobile', 'desktop']) {
    const runs = [];
    for (let i = 1; i <= 3; i++) {
      const chrome = await chromium.launch({
        headless: true,
        args: ['--remote-debugging-port=9333'],
      });
      summary.environment.chromeVersion = chrome.version();
      try {
        const options = {
          port: 9333,
          output: ['html', 'json'],
          logLevel: 'error',
          onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        };
        const result = await lighthouse(
          `http://127.0.0.1:4173/${page === 'detail' ? 'nft/1' : ''}`,
          options,
          profile === 'desktop' ? desktopConfig : undefined,
        );
        if (result.lhr.configSettings.formFactor !== profile) {
          throw new Error(`Perfil incorreto: esperado ${profile}, recebido ${result.lhr.configSettings.formFactor}`);
        }
        await fs.writeFile(`${root}/${page}-${profile}-${i}.html`, result.report[0]);
        await fs.writeFile(`${root}/${page}-${profile}-${i}.json`, result.report[1]);
        const scores = Object.fromEntries(
          Object.entries(result.lhr.categories).map(([key, value]) => [
            key,
            Math.round(value.score * 100),
          ]),
        );
        const metrics = Object.fromEntries(
          ['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time'].map(
            (k) => [k, result.lhr.audits[k].numericValue],
          ),
        );
        runs.push({ ...scores, ...metrics });
        summary.lighthouseVersion = result.lhr.lighthouseVersion;
        console.log(page, profile, i, scores);
      } finally {
        await chrome.close();
      }
    }
    const median = Object.fromEntries(
      Object.keys(runs[0]).map((k) => [k, runs.map((r) => r[k]).sort((a, b) => a - b)[1]]),
    );
    summary.results.push({ page, profile, runs, median });
    await fs.writeFile(`${root}/summary.json`, JSON.stringify(summary, null, 2));
  }

import { BaseService } from "../common/base.service";
import { RenderedOutputModel } from "./renderedOutput.model";
import { RenderedOutput } from "../../types/entities";
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
export class RenderedOutputService extends BaseService<RenderedOutput> {
  constructor() {
    super(new RenderedOutputModel());
  }
  async generatePdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch();
    try {
      const page = await browser.newPage();
      await page.setContent(`
      <html>
      <head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        >
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@latest/dist/tailwind.min.css">
        <style>
          body {
            font-family: 'Roboto', sans-serif;
          }
        </style>
      </head>
      <body>
      ${html}
      </body>
      </html>
      `, {
        waitUntil: 'domcontentloaded'
      });
      await page.waitForNetworkIdle();
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '5mm',
          bottom: '10mm',
          left: '5mm'
        }
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}
export default new RenderedOutputService();

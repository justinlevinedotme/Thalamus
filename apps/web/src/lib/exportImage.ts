import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

const getExportElement = () => document.getElementById("graph-canvas");

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const downloadDataUrl = (dataUrl: string, filename: string) => {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
};

export async function exportGraphPng(title: string) {
  const element = getExportElement();
  if (!element) {
    throw new Error("Graph canvas not found");
  }

  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });

  const fileName = `${slugify(title || "graph")}.png`;
  downloadDataUrl(dataUrl, fileName);
}

export async function exportGraphPdf(title: string) {
  const element = getExportElement();
  if (!element) {
    throw new Error("Graph canvas not found");
  }

  const rect = element.getBoundingClientRect();
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });

  const pdf = new jsPDF({
    orientation: rect.width >= rect.height ? "landscape" : "portrait",
    unit: "px",
    format: [rect.width, rect.height],
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, rect.width, rect.height);
  pdf.save(`${slugify(title || "graph")}.pdf`);
}

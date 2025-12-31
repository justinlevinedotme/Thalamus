/**
 * @file exportImage.ts
 * @description Image export utilities for the graph canvas. Supports exporting graphs
 * as PNG images or PDF documents using html-to-image and jsPDF. Handles viewport
 * calculation and proper scaling for exports.
 */

import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import {
  getNodesBounds,
  type Node as ReactFlowNode,
  type Edge as ReactFlowEdge,
} from "@xyflow/react";

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

export type ExportMargin = "none" | "small" | "medium" | "large";
export type ExportFormat = "png" | "pdf";
export type ExportQuality = "standard" | "high" | "ultra";

export type ExportOptions = {
  transparentBackground?: boolean;
  margin?: ExportMargin;
  backgroundColor?: string;
  quality?: ExportQuality;
  hideGrid?: boolean;
};

const qualityToPixelRatio = (quality: ExportQuality): number => {
  switch (quality) {
    case "standard":
      return 1;
    case "high":
      return 2;
    case "ultra":
      return 4;
    default:
      return 2;
  }
};

const marginToPixels = (margin: ExportMargin): number => {
  switch (margin) {
    case "none":
      return 0;
    case "small":
      return 20;
    case "medium":
      return 40;
    case "large":
      return 80;
    default:
      return 20;
  }
};

// Get class name string from element (handles both HTML and SVG elements)
function getClassName(element: Element): string {
  const className = element.className;
  if (typeof className === "string") {
    return className;
  }
  // SVG elements have className as SVGAnimatedString
  if (className && typeof className === "object" && "baseVal" in className) {
    return (className as SVGAnimatedString).baseVal;
  }
  return "";
}

// Check if element should be filtered out from export
function shouldFilterElement(element: Element, hideGrid: boolean): boolean {
  const className = getClassName(element);

  // Elements to always hide during export
  const hiddenClasses = [
    "react-flow__controls",
    "react-flow__minimap",
    "helper-line",
    "react-flow__handle",
    "react-flow__resize-control",
    "react-flow__nodesselection",
    "react-flow__edgelabel-renderer",
    "react-flow__edge-textwrapper",
    "react-flow__edge-text",
    "react-flow__edge-textbg",
  ];

  // Conditionally hide grid based on setting
  if (hideGrid) {
    hiddenClasses.push("react-flow__background");
  }

  for (const hiddenClass of hiddenClasses) {
    if (className.includes(hiddenClass)) {
      return true;
    }
  }

  return false;
}

async function captureGraphImage(
  nodes: ReactFlowNode[],
  _edges: ReactFlowEdge[],
  options: ExportOptions = {}
): Promise<{ dataUrl: string; width: number; height: number }> {
  // Get the react-flow container
  const reactFlow = document.querySelector(".react-flow") as HTMLElement;
  if (!reactFlow) {
    throw new Error("React Flow container not found");
  }

  const viewport = reactFlow.querySelector(".react-flow__viewport") as HTMLElement;
  if (!viewport) {
    throw new Error("React Flow viewport not found");
  }

  // Calculate margin in pixels
  const marginPx = marginToPixels(options.margin ?? "small");

  // Calculate bounds of all nodes
  const nodesBounds = getNodesBounds(nodes);

  // Calculate the export dimensions based on content bounds + margin
  // This crops to exactly fit the content
  const contentWidth = nodesBounds.width;
  const contentHeight = nodesBounds.height;
  const exportWidth = contentWidth + marginPx * 2;
  const exportHeight = contentHeight + marginPx * 2;

  // Calculate viewport transform to position content with margin
  // We want zoom = 1 (actual size) and position the content centered with margin
  const zoom = 1;
  const x = -nodesBounds.x + marginPx;
  const y = -nodesBounds.y + marginPx;

  // Store original transform
  const originalTransform = viewport.style.transform;

  // Apply the calculated transform to position content for capture
  viewport.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;

  // Track elements we modify so we can restore them
  const hiddenElements: { el: HTMLElement; originalDisplay: string }[] = [];
  const modifiedBgElements: { el: HTMLElement; originalBg: string }[] = [];

  // Helper to hide elements and track for restoration
  const hideElements = (selector: string) => {
    reactFlow.querySelectorAll(selector).forEach((el) => {
      const htmlEl = el as HTMLElement;
      hiddenElements.push({ el: htmlEl, originalDisplay: htmlEl.style.display });
      htmlEl.style.display = "none";
    });
  };

  // Hide edge labels
  hideElements(".react-flow__edge text");
  hideElements(".react-flow__edge-text");
  hideElements(".react-flow__edge-textwrapper");
  hideElements(".react-flow__edge rect");

  // Conditionally hide grid background
  if (options.hideGrid !== false) {
    hideElements(".react-flow__background");
  }

  // If transparent, we need to make backgrounds transparent
  let originalReactFlowBg: string | null = null;
  if (options.transparentBackground) {
    // Make the main react-flow container transparent
    originalReactFlowBg = reactFlow.style.backgroundColor;
    reactFlow.style.backgroundColor = "transparent";

    // Also make the background pattern transparent if it's visible (not hidden)
    if (options.hideGrid === false) {
      reactFlow.querySelectorAll(".react-flow__background").forEach((el) => {
        const htmlEl = el as HTMLElement;
        modifiedBgElements.push({ el: htmlEl, originalBg: htmlEl.style.backgroundColor });
        htmlEl.style.backgroundColor = "transparent";
      });
    }
  }

  try {
    // Capture using html-to-image
    const pixelRatio = qualityToPixelRatio(options.quality ?? "high");
    const dataUrl = await toPng(reactFlow, {
      cacheBust: true,
      pixelRatio,
      width: exportWidth,
      height: exportHeight,
      backgroundColor: options.transparentBackground
        ? "transparent"
        : (options.backgroundColor ?? "#ffffff"),
      filter: (domNode) => {
        if (domNode.nodeType !== 1) {
          return true;
        }
        return !shouldFilterElement(domNode as Element, options.hideGrid !== false);
      },
    });

    return {
      dataUrl,
      width: exportWidth,
      height: exportHeight,
    };
  } finally {
    // Restore viewport transform
    viewport.style.transform = originalTransform;

    // Restore react-flow background color if we changed it
    if (originalReactFlowBg !== null) {
      reactFlow.style.backgroundColor = originalReactFlowBg;
    }

    // Restore all hidden elements
    hiddenElements.forEach(({ el, originalDisplay }) => {
      el.style.display = originalDisplay;
    });

    // Restore background colors
    modifiedBgElements.forEach(({ el, originalBg }) => {
      el.style.backgroundColor = originalBg;
    });
  }
}

export async function generateExportPreview(
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[],
  options: ExportOptions = {}
): Promise<string> {
  const { dataUrl } = await captureGraphImage(nodes, edges, options);
  return dataUrl;
}

export async function exportGraphPng(
  title: string,
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[],
  options: ExportOptions = {}
) {
  const { dataUrl } = await captureGraphImage(nodes, edges, options);
  const fileName = `${slugify(title || "graph")}.png`;
  downloadDataUrl(dataUrl, fileName);
}

export async function exportGraphPdf(
  title: string,
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[],
  options: ExportOptions = {}
) {
  const { dataUrl, width, height } = await captureGraphImage(nodes, edges, options);

  const pdf = new jsPDF({
    orientation: width >= height ? "landscape" : "portrait",
    unit: "px",
    format: [width, height],
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
  pdf.save(`${slugify(title || "graph")}.pdf`);
}

export function centerText(value: string, width: number): string {
  if (value.length >= width) return value;
  const padding = Math.floor((width - value.length) / 2);
  return " ".repeat(padding) + value;
}

export function alignLeftRight(left: string, right: string, width: number): string {
  const maxLeft = width - right.length - 1;
  const truncatedLeft = left.length > maxLeft ? left.slice(0, maxLeft) : left;
  const spaces = width - truncatedLeft.length - right.length;
  return truncatedLeft + " ".repeat(Math.max(1, spaces)) + right;
}

export function repeatCharacter(character: string, width: number): string {
  return character.repeat(width);
}

export function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - 1) + "…";
}

export function wrapText(value: string, maxWidth: number): string[] {
  if (maxWidth <= 0) return [value];
  if (value.length <= maxWidth) return [value];

  const words = value.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length === 0) {
      if (word.length > maxWidth) {
        let remaining = word;
        while (remaining.length > maxWidth) {
          lines.push(remaining.slice(0, maxWidth));
          remaining = remaining.slice(maxWidth);
        }
        currentLine = remaining;
      } else {
        currentLine = word;
      }
    } else if (currentLine.length + 1 + word.length <= maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      if (word.length > maxWidth) {
        let remaining = word;
        while (remaining.length > maxWidth) {
          lines.push(remaining.slice(0, maxWidth));
          remaining = remaining.slice(maxWidth);
        }
        currentLine = remaining;
      } else {
        currentLine = word;
      }
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [value];
}

export function Avatar({ initials, size = 36, color = "#FC4C02", textColor = "#fff", src }) {
  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: color,
        color: textColor,
        fontSize: size * 0.35,
        letterSpacing: "0.02em",
      }}
    >
      {initials}
    </div>
  );
}

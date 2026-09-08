import React, { useState, useRef, useCallback } from "react";
import {
  Plus,
  Link2,
  Trash2,
  Image as ImageIcon,
  Pencil,
  Download,
  FolderOpen,
  X,
  Eraser,
  Undo2,
  Sun,
  Moon,
  User,
  BookOpen,
} from "lucide-react";

// ---------- 색상 & 태그 사전 ----------
const ROLE_STYLES = [
  { match: "주인공", border: "#D9A441", tint: "#FBF1D9" },
  { match: "대립", border: "#C96B5B", tint: "#FAE5E1" },
  { match: "조력", border: "#5E9E82", tint: "#E4F1E9" },
  { match: "조연", border: "#7D8CA6", tint: "#E7EBF2" },
];
const DEFAULT_ROLE = { border: "#9B98B0", tint: "#EEECF3" };

function roleStyle(tag = "") {
  const found = ROLE_STYLES.find((r) => tag.includes(r.match));
  return found || DEFAULT_ROLE;
}

const EDGE_COLORS = [
  { color: "#5E9E82", name: "우호" },
  { color: "#C96B5B", name: "갈등" },
  { color: "#C97AA6", name: "로맨스" },
  { color: "#8A87A0", name: "가족" },
  { color: "#D9A441", name: "기타" },
];

const CARD_W = 168;
const CARD_H = 178;
const PRIMARY = "#3F7D7A";
const PRIMARY_DARK = "#356865";

function theme(dark) {
  return dark
    ? {
        bg: "#1C1B26",
        text: "#F3F0FF",
        subtext: "#B9B4CC",
        panel: "#2E2C3E",
        border: "#3A3750",
        dot: "#33313F",
        canvasLabelBg: "#1C1B26",
      }
    : {
        bg: "#FBF7EF",
        text: "#3A3358",
        subtext: "#8B8698",
        panel: "#FFFFFF",
        border: "#E7DFC9",
        dot: "#E7DFC9",
        canvasLabelBg: "#FBF7EF",
      };
}

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ================= 그림판 팝업 =================
function DrawPad({ onSave, onClose, dark }) {
  const t = theme(dark);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(t.text);
  const [size, setSize] = useState(6);
  const [eraser, setEraser] = useState(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e) => {
    drawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvas.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = eraser ? size * 2.5 : size;
    ctx.strokeStyle = eraser ? "#FFFFFF" : color;
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const end = () => (drawing.current = false);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  React.useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 shadow-xl"
        style={{ background: t.panel, color: t.text }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-lg">얼굴 그리기</h3>
          <button onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={260}
          height={260}
          className="mx-auto touch-none rounded-xl border"
          style={{ borderColor: t.border, background: "#FFFFFF" }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        <div className="mt-4 flex items-center gap-2">
          {["#3A3358", "#C96B5B", "#5E9E82", "#D9A441", "#7D8CA6", "#C97AA6"].map(
            (c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setEraser(false);
                }}
                className="h-7 w-7 rounded-full border-2"
                style={{ background: c, borderColor: color === c && !eraser ? t.text : "transparent" }}
                aria-label={`색상 ${c}`}
              />
            )
          )}
          <button
            onClick={() => setEraser((v) => !v)}
            className="ml-1 rounded-full border-2 p-1.5"
            style={{ borderColor: eraser ? t.text : "transparent" }}
            aria-label="지우개"
          >
            <Eraser size={16} />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span>펜 굵기</span>
          <input
            type="range"
            min={2}
            max={20}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="flex-1"
          />
        </div>
        <div className="mt-4 flex justify-between">
          <button
            onClick={clear}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm opacity-70 hover:opacity-100"
          >
            <Undo2 size={14} /> 전체 지우기
          </button>
          <button
            onClick={() => onSave(canvasRef.current.toDataURL("image/png"))}
            className="rounded-lg px-4 py-1.5 text-sm font-medium text-white"
            style={{ background: PRIMARY }}
            onMouseEnter={(e) => (e.currentTarget.style.background = PRIMARY_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.background = PRIMARY)}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= 인물 카드 =================
function CharacterCard({ node, selected, pending, dark, onPointerDownCard, onClick }) {
  const t = theme(dark);
  const style = roleStyle(node.tags);
  return (
    <div
      onPointerDown={(e) => onPointerDownCard(e, node)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(node.id);
      }}
      style={{
        left: node.x,
        top: node.y,
        width: CARD_W,
        height: CARD_H,
        borderColor: selected ? PRIMARY : pending ? "#D9A441" : style.border,
        borderWidth: selected || pending ? 3 : 2.5,
        background: t.panel,
        boxShadow: selected
          ? `0 0 0 3px ${PRIMARY}33`
          : pending
          ? "0 0 0 3px #D9A44133"
          : "0 1px 3px rgba(0,0,0,0.08)",
      }}
      className="absolute cursor-grab touch-none select-none rounded-2xl border-solid p-3 transition-shadow active:cursor-grabbing"
    >
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border"
          style={{ borderColor: style.border, background: style.tint }}
        >
          {node.image ? (
            <img src={node.image} alt={node.name} className="h-full w-full object-cover" />
          ) : (
            <User size={26} style={{ opacity: 0.4, color: t.text }} />
          )}
        </div>
        <div className="max-w-full truncate text-[15px] font-semibold" style={{ color: t.text }}>
          {node.name || "이름 없음"}
        </div>
        {node.tags && (
          <span
            className="rounded-full px-2 py-0.5 text-[11px]"
            style={{ background: style.tint, color: style.border }}
          >
            {node.tags}
          </span>
        )}
        <p className="line-clamp-2 text-center text-[11px] leading-tight" style={{ color: t.subtext }}>
          {node.personality}
        </p>
      </div>
    </div>
  );
}

// ---------- 재사용 버튼 컴포넌트 ----------
function ToolbarButton({ onClick, icon, children, variant = "outline", active = false, t }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid",
    whiteSpace: "nowrap",
  };
  const styleMap = {
    primary: { background: PRIMARY, borderColor: PRIMARY, color: "#FFFFFF" },
    outline: {
      background: active ? "#D9A44122" : "transparent",
      borderColor: active ? "#D9A441" : t.border,
      color: active ? "#8A6414" : t.text,
    },
    danger: { background: "transparent", borderColor: "#C96B5B", color: "#C96B5B" },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...styleMap[variant] }}>
      {icon}
      {children}
    </button>
  );
}

// ================= 메인 앱 =================
export default function BookCharacterMap() {
  const [dark, setDark] = useState(false);
  const t = theme(dark);
  const [bookInfo, setBookInfo] = useState({ title: "", author: "" });
  const [characters, setCharacters] = useState([]);
  const [relations, setRelations] = useState([]);
  const [selected, setSelected] = useState(null); // {type:'character'|'relation', id}
  const [connectMode, setConnectMode] = useState(false);
  const [pendingSource, setPendingSource] = useState(null);
  const [drawTargetId, setDrawTargetId] = useState(null);

  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const fileInputRef = useRef(null);
  const jsonInputRef = useRef(null);

  const selectedCharacter =
    selected?.type === "character" ? characters.find((c) => c.id === selected.id) : null;
  const selectedRelation =
    selected?.type === "relation" ? relations.find((r) => r.id === selected.id) : null;

  const addCharacter = () => {
    const idx = characters.length;
    const newChar = {
      id: uid(),
      name: "",
      personality: "",
      tags: "",
      image: null,
      x: 60 + (idx % 4) * 200,
      y: 40 + Math.floor(idx / 4) * 220,
    };
    setCharacters((prev) => [...prev, newChar]);
    setSelected({ type: "character", id: newChar.id });
  };

  const updateCharacter = (id, patch) =>
    setCharacters((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const deleteCharacter = (id) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    setRelations((prev) => prev.filter((r) => r.source !== id && r.target !== id));
    setSelected(null);
  };

  const updateRelation = (id, patch) =>
    setRelations((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const deleteRelation = (id) => {
    setRelations((prev) => prev.filter((r) => r.id !== id));
    setSelected(null);
  };

  const onPointerDownCard = useCallback(
    (e, node) => {
      if (connectMode) return;
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { id: node.id, startX: e.clientX, startY: e.clientY, origX: node.x, origY: node.y };

      const onMove = (ev) => {
        if (!dragRef.current) return;
        const { id, startX, startY, origX, origY } = dragRef.current;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        updateCharacter(id, { x: origX + dx, y: origY + dy });
      };
      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [connectMode]
  );

  const onCardClick = (id) => {
    if (connectMode) {
      if (!pendingSource) {
        setPendingSource(id);
      } else if (pendingSource !== id) {
        const newRel = {
          id: uid(),
          source: pendingSource,
          target: id,
          label: "",
          color: EDGE_COLORS[0].color,
          style: "solid",
        };
        setRelations((prev) => [...prev, newRel]);
        setPendingSource(null);
        setConnectMode(false);
        setSelected({ type: "relation", id: newRel.id });
      }
      return;
    }
    setSelected({ type: "character", id });
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCharacter) return;
    const reader = new FileReader();
    reader.onload = () => updateCharacter(selectedCharacter.id, { image: reader.result });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const exportJSON = () => {
    const data = JSON.stringify({ bookInfo, characters, relations }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bookInfo.title || "인물관계도"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.bookInfo) setBookInfo(data.bookInfo);
        if (Array.isArray(data.characters)) setCharacters(data.characters);
        if (Array.isArray(data.relations)) setRelations(data.relations);
        setSelected(null);
      } catch (err) {
        alert("파일을 읽을 수 없어요. 올바른 JSON 파일인지 확인해 주세요.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const exportPNG = async () => {
    const W = 1400;
    const H = 1000;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = t.text;
    ctx.font = "bold 26px Georgia, serif";
    ctx.fillText(
      `${bookInfo.title || "제목 없음"}${bookInfo.author ? "  ·  " + bookInfo.author : ""}`,
      36,
      46
    );

    relations.forEach((r) => {
      const s = characters.find((c) => c.id === r.source);
      const tt = characters.find((c) => c.id === r.target);
      if (!s || !tt) return;
      const sx = s.x + CARD_W / 2,
        sy = s.y + 90 + 70;
      const tx = tt.x + CARD_W / 2,
        ty = tt.y + 90 + 70;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 3;
      ctx.setLineDash(r.style === "dashed" ? [8, 6] : []);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);
      if (r.label) {
        const mx = (sx + tx) / 2,
          my = (sy + ty) / 2;
        ctx.font = "13px sans-serif";
        const w = ctx.measureText(r.label).width + 16;
        ctx.fillStyle = t.panel;
        roundRectPath(ctx, mx - w / 2, my - 12, w, 22, 8);
        ctx.fill();
        ctx.fillStyle = t.text;
        ctx.textAlign = "center";
        ctx.fillText(r.label, mx, my + 4);
        ctx.textAlign = "left";
      }
    });

    for (const c of characters) {
      const style = roleStyle(c.tags);
      const cx = c.x,
        cy = c.y + 90;
      ctx.fillStyle = t.panel;
      roundRectPath(ctx, cx, cy, CARD_W, CARD_H, 16);
      ctx.fill();
      ctx.strokeStyle = style.border;
      ctx.lineWidth = 2.5;
      roundRectPath(ctx, cx, cy, CARD_W, CARD_H, 16);
      ctx.stroke();

      const centerX = cx + CARD_W / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, cy + 44, 32, 0, Math.PI * 2);
      ctx.closePath();
      if (c.image) {
        try {
          const img = await loadImage(c.image);
          ctx.clip();
          ctx.drawImage(img, centerX - 32, cy + 12, 64, 64);
        } catch (e) {}
      } else {
        ctx.fillStyle = style.tint;
        ctx.fill();
      }
      ctx.restore();

      ctx.fillStyle = t.text;
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(c.name || "이름 없음", centerX, cy + 96);
      if (c.tags) {
        ctx.font = "11px sans-serif";
        ctx.fillStyle = style.border;
        ctx.fillText(c.tags, centerX, cy + 114);
      }
      ctx.textAlign = "left";
    }

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bookInfo.title || "인물관계도"}.png`;
    a.click();
  };

  return (
    <div className="flex h-[720px] w-full flex-col font-sans" style={{ background: t.bg, color: t.text }}>
      {/* 상단: 책 정보 */}
      <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3" style={{ borderColor: t.border }}>
        <BookOpen size={20} className="shrink-0" style={{ opacity: 0.6 }} />
        <input
          value={bookInfo.title}
          onChange={(e) => setBookInfo((b) => ({ ...b, title: e.target.value }))}
          placeholder="책 제목을 입력하세요"
          className="min-w-[140px] flex-1 rounded-lg border bg-transparent px-3 py-1.5 font-serif text-lg outline-none"
          style={{ borderColor: t.border, color: t.text }}
        />
        <input
          value={bookInfo.author}
          onChange={(e) => setBookInfo((b) => ({ ...b, author: e.target.value }))}
          placeholder="저자"
          className="w-32 rounded-lg border bg-transparent px-3 py-1.5 text-sm outline-none"
          style={{ borderColor: t.border, color: t.text }}
        />
        <button
          onClick={() => setDark((d) => !d)}
          className="rounded-full border p-2"
          style={{ borderColor: t.border, color: t.text, opacity: 0.75 }}
          aria-label="테마 전환"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-2 border-b px-5 py-2.5" style={{ borderColor: t.border }}>
        <ToolbarButton t={t} variant="primary" onClick={addCharacter} icon={<Plus size={15} />}>
          새 인물 추가
        </ToolbarButton>
        <ToolbarButton
          t={t}
          variant="outline"
          active={connectMode}
          onClick={() => {
            setConnectMode((v) => !v);
            setPendingSource(null);
          }}
          icon={<Link2 size={15} />}
        >
          {connectMode ? "인물을 두 명 클릭하세요" : "관계 연결"}
        </ToolbarButton>
        <div className="mx-1 h-5 w-px" style={{ background: t.border }} />
        <ToolbarButton t={t} onClick={exportPNG} icon={<Download size={15} />}>
          PNG 저장
        </ToolbarButton>
        <ToolbarButton t={t} onClick={exportJSON} icon={<Download size={15} />}>
          JSON 저장
        </ToolbarButton>
        <ToolbarButton t={t} onClick={() => jsonInputRef.current?.click()} icon={<FolderOpen size={15} />}>
          불러오기
        </ToolbarButton>
        <input ref={jsonInputRef} type="file" accept="application/json" className="hidden" onChange={importJSON} />
        <span className="ml-auto text-xs" style={{ opacity: 0.5 }}>
          카드를 드래그해서 자유롭게 배치해 보세요
        </span>
      </div>

      {/* 본문: 캔버스 + 사이드 패널 */}
      <div className="flex min-h-0 flex-1">
        <div
          ref={canvasRef}
          onClick={() => setSelected(null)}
          className="relative flex-1 overflow-auto"
          style={{
            backgroundImage: `radial-gradient(${t.dot} 1px, transparent 1px)`,
            backgroundSize: "22px 22px",
          }}
        >
          <div className="relative" style={{ width: 1600, height: 1100 }}>
            {characters.length === 0 && (
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                style={{ opacity: 0.5 }}
              >
                <p className="font-serif text-lg">아직 인물이 없어요</p>
                <p className="text-sm">위의 “+ 새 인물 추가” 버튼을 눌러 첫 인물을 만들어 보세요</p>
              </div>
            )}

            <svg className="pointer-events-none absolute inset-0" width={1600} height={1100}>
              {relations.map((r) => {
                const s = characters.find((c) => c.id === r.source);
                const tt = characters.find((c) => c.id === r.target);
                if (!s || !tt) return null;
                const sx = s.x + CARD_W / 2,
                  sy = s.y + 70;
                const tx = tt.x + CARD_W / 2,
                  ty = tt.y + 70;
                const mx = (sx + tx) / 2,
                  my = (sy + ty) / 2;
                return (
                  <g key={r.id}>
                    <line
                      x1={sx}
                      y1={sy}
                      x2={tx}
                      y2={ty}
                      stroke={r.color}
                      strokeWidth={selected?.id === r.id ? 4 : 2.5}
                      strokeDasharray={r.style === "dashed" ? "7,6" : undefined}
                    />
                    <line
                      x1={sx}
                      y1={sy}
                      x2={tx}
                      y2={ty}
                      stroke="transparent"
                      strokeWidth={14}
                      className="pointer-events-auto cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected({ type: "relation", id: r.id });
                      }}
                    />
                    {r.label && (
                      <text
                        x={mx}
                        y={my - 6}
                        textAnchor="middle"
                        fontSize="12"
                        fill={t.text}
                        style={{ paintOrder: "stroke", stroke: t.canvasLabelBg, strokeWidth: 5 }}
                      >
                        {r.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {characters.map((node) => (
              <CharacterCard
                key={node.id}
                node={node}
                dark={dark}
                selected={selected?.type === "character" && selected.id === node.id}
                pending={pendingSource === node.id}
                onPointerDownCard={onPointerDownCard}
                onClick={onCardClick}
              />
            ))}
          </div>
        </div>

        {/* 사이드 패널 */}
        {(selectedCharacter || selectedRelation) && (
          <div
            className="w-72 shrink-0 overflow-y-auto border-l p-4"
            style={{ borderColor: t.border, background: t.panel }}
          >
            {selectedCharacter && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base">인물 편집</h3>
                  <button onClick={() => setSelected(null)}>
                    <X size={16} />
                  </button>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border"
                    style={{ borderColor: roleStyle(selectedCharacter.tags).border }}
                  >
                    {selectedCharacter.image ? (
                      <img src={selectedCharacter.image} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <User size={30} style={{ opacity: 0.4 }} />
                    )}
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 rounded-lg border px-2.5 py-1"
                      style={{ borderColor: t.border }}
                    >
                      <ImageIcon size={13} /> 사진 업로드
                    </button>
                    <button
                      onClick={() => setDrawTargetId(selectedCharacter.id)}
                      className="flex items-center gap-1 rounded-lg border px-2.5 py-1"
                      style={{ borderColor: t.border }}
                    >
                      <Pencil size={13} /> 그림 그리기
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </div>

                <label className="text-xs" style={{ opacity: 0.6 }}>
                  인물 이름
                </label>
                <input
                  value={selectedCharacter.name}
                  onChange={(e) => updateCharacter(selectedCharacter.id, { name: e.target.value })}
                  placeholder="예: 홍길동"
                  className="rounded-lg border bg-transparent px-3 py-1.5 text-sm outline-none"
                  style={{ borderColor: t.border, color: t.text }}
                />

                <label className="text-xs" style={{ opacity: 0.6 }}>
                  역할 / 태그
                </label>
                <input
                  value={selectedCharacter.tags}
                  onChange={(e) => updateCharacter(selectedCharacter.id, { tags: e.target.value })}
                  placeholder="예: 주인공, 조력자, 대립 인물"
                  list="role-suggestions"
                  className="rounded-lg border bg-transparent px-3 py-1.5 text-sm outline-none"
                  style={{ borderColor: t.border, color: t.text }}
                />
                <datalist id="role-suggestions">
                  <option value="주인공" />
                  <option value="대립 인물" />
                  <option value="조력자" />
                  <option value="조연" />
                </datalist>

                <label className="text-xs" style={{ opacity: 0.6 }}>
                  성격 및 특징
                </label>
                <textarea
                  value={selectedCharacter.personality}
                  onChange={(e) => updateCharacter(selectedCharacter.id, { personality: e.target.value })}
                  placeholder="예: 정의롭고 용감함"
                  rows={4}
                  className="resize-none rounded-lg border bg-transparent px-3 py-1.5 text-sm outline-none"
                  style={{ borderColor: t.border, color: t.text }}
                />

                <ToolbarButton t={t} variant="danger" onClick={() => deleteCharacter(selectedCharacter.id)} icon={<Trash2 size={14} />}>
                  인물 삭제
                </ToolbarButton>
              </div>
            )}

            {selectedRelation && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base">관계 편집</h3>
                  <button onClick={() => setSelected(null)}>
                    <X size={16} />
                  </button>
                </div>

                <label className="text-xs" style={{ opacity: 0.6 }}>
                  관계 설명
                </label>
                <input
                  value={selectedRelation.label}
                  onChange={(e) => updateRelation(selectedRelation.id, { label: e.target.value })}
                  placeholder="예: 서로 돕는 친구"
                  className="rounded-lg border bg-transparent px-3 py-1.5 text-sm outline-none"
                  style={{ borderColor: t.border, color: t.text }}
                />

                <label className="text-xs" style={{ opacity: 0.6 }}>
                  선 색상
                </label>
                <div className="flex flex-wrap gap-2">
                  {EDGE_COLORS.map((ec) => (
                    <button
                      key={ec.color}
                      onClick={() => updateRelation(selectedRelation.id, { color: ec.color })}
                      className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs"
                      style={{
                        background: ec.color + "22",
                        borderColor: selectedRelation.color === ec.color ? ec.color : "transparent",
                        color: t.text,
                      }}
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: ec.color }} />
                      {ec.name}
                    </button>
                  ))}
                </div>

                <label className="text-xs" style={{ opacity: 0.6 }}>
                  선 스타일
                </label>
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => updateRelation(selectedRelation.id, { style: "solid" })}
                    className="flex-1 rounded-lg border py-1.5"
                    style={{
                      borderColor: t.border,
                      background: selectedRelation.style === "solid" ? PRIMARY + "22" : "transparent",
                    }}
                  >
                    실선
                  </button>
                  <button
                    onClick={() => updateRelation(selectedRelation.id, { style: "dashed" })}
                    className="flex-1 rounded-lg border py-1.5"
                    style={{
                      borderColor: t.border,
                      background: selectedRelation.style === "dashed" ? PRIMARY + "22" : "transparent",
                    }}
                  >
                    점선
                  </button>
                </div>

                <ToolbarButton t={t} variant="danger" onClick={() => deleteRelation(selectedRelation.id)} icon={<Trash2 size={14} />}>
                  관계 삭제
                </ToolbarButton>
              </div>
            )}
          </div>
        )}
      </div>

      {drawTargetId && (
        <DrawPad
          dark={dark}
          onClose={() => setDrawTargetId(null)}
          onSave={(dataUrl) => {
            updateCharacter(drawTargetId, { image: dataUrl });
            setDrawTargetId(null);
          }}
        />
      )}
    </div>
  );
}

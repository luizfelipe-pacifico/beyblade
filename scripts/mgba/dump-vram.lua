-- Salva VRAM, paletas, OAM e registradores de vídeo enquanto o jogo roda no mGBA (0.10+).
-- Uso: mGBA > Tools > Scripting > File > Load script, depois jogue normalmente.
-- Um "snapshot" é gravado quando os sprites (VRAM de objetos ou OAM) mudam, no máximo a cada CHECK_EVERY frames.
-- Saída em assets-rom/mgba/ (fora do git, D-007); converta com: node scripts/render-vram.js

local CHECK_EVERY = 30
local MAX_SNAPSHOTS = 400

local here = debug.getinfo(1, "S").source:sub(2):gsub("\\", "/"):match("(.*/)") or "./"
local OUT_DIR = here .. "../../assets-rom/mgba/"
os.execute('mkdir "' .. OUT_DIR:gsub("/", "\\") .. '" 2>nul')

local REGIONS = {
  { name = "io", address = 0x04000000, length = 0x60 },
  { name = "pal", address = 0x05000000, length = 0x400 },
  { name = "vram", address = 0x06000000, length = 0x18000 },
  { name = "oam", address = 0x07000000, length = 0x400 },
}

local lastObj, lastOam
local snapshots = 0

local function write(path, data)
  local f = assert(io.open(path, "wb"))
  f:write(data)
  f:close()
end

local function snapshot(frame)
  local prefix = string.format("%ssnap-%07d-", OUT_DIR, frame)
  for _, r in ipairs(REGIONS) do
    write(prefix .. r.name .. ".bin", emu:readRange(r.address, r.length))
  end
  emu:screenshot(prefix .. "screen.png")
  snapshots = snapshots + 1
  console:log(string.format("snapshot %d (frame %d)", snapshots, frame))
end

callbacks:add("frame", function()
  local frame = emu:currentFrame()
  if frame % CHECK_EVERY ~= 0 or snapshots >= MAX_SNAPSHOTS then return end
  local obj = emu:readRange(0x06010000, 0x8000)
  local oam = emu:readRange(0x07000000, 0x400)
  if obj ~= lastObj or oam ~= lastOam then
    lastObj, lastOam = obj, oam
    snapshot(frame)
  end
end)

console:log("dump-vram: gravando em " .. OUT_DIR)

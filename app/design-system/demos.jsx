'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FeraField } from '@/components/game/fera-field';
import { SpinRing } from '@/components/game/spin-ring';
import { GaugeBar } from '@/components/game/gauge-bar';
import { Announcement } from '@/components/game/announcement';
import { TitleCard } from '@/components/game/title-card';
import { feraArte } from '@/content/roster';

export function MotionDemo() {
  const [corte, setCorte] = useState(0);
  const [linhas, setLinhas] = useState(true);
  return (
    <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
      <FeraField key={corte} fera="dranzer" movendo={linhas} className="varredura grid min-h-72 content-end p-8">
        <TitleCard nome="Kai" sub="Dranzer G" />
      </FeraField>
      <div className="flex flex-col gap-4">
        <Button size="lg" onClick={() => setCorte((n) => n + 1)}>
          Repetir a varredura
        </Button>
        <label className="flex items-center gap-3 text-base font-semibold">
          <Switch checked={linhas} onCheckedChange={setLinhas} />
          Linhas de velocidade correndo
        </label>
        <p className="text-texto-2">
          A varredura entra pela diagonal em 260 ms com ease-out forte. Com movimento reduzido, vira só uma troca de opacidade; na
          qualidade Baixa, as linhas param.
        </p>
      </div>
    </div>
  );
}

export function SpinDemo() {
  const [giro, setGiro] = useState(78);
  const [especial, setEspecial] = useState(100);
  const v = giro / 100;
  return (
    <div className="grid items-center gap-10 md:grid-cols-[auto_1fr]">
      <SpinRing value={v} fera="dragoon" dir={-1} size={220}>
        <img src={feraArte('dragoon', 'emblema')} alt="" className="size-full" />
      </SpinRing>
      <div className="grid gap-6">
        <label className="grid gap-3 text-base font-semibold">
          Giro: <span className="tabular-nums">{giro}%</span>
          <Slider value={[giro]} onValueChange={([n]) => setGiro(n)} max={100} step={1} aria-label="Giro" />
        </label>
        <GaugeBar label="Giro" value={v} fera="dragoon" />
        <label className="grid gap-3 text-base font-semibold">
          Especial: <span className="tabular-nums">{especial}%</span>
          <Slider value={[especial]} onValueChange={([n]) => setEspecial(n)} max={100} step={5} aria-label="Especial" />
        </label>
        <GaugeBar label="Especial" value={especial / 100} tipo="especial" />
        <p className="text-texto-2">
          Mais giro, mais marcas no anel e rotação mais rápida. Abaixo de 25%, o arco fica amarelo de chamada: é o aviso de que a
          bey vai parar. A Dragoon gira para a esquerda, então o anel também.
        </p>
      </div>
    </div>
  );
}

export function AnnouncementDemo() {
  const [n, setN] = useState(0);
  const finais = [
    ['Fora!', 'Tyson vence a rodada'],
    ['Burst!', 'Kai vence a rodada'],
    ['Parada', 'Ray vence a rodada'],
  ];
  const [titulo, sub] = finais[n % finais.length];
  return (
    <div className="grid min-h-72 grid-rows-[1fr_auto] gap-6 overflow-hidden bg-tinta-2 p-8">
      <div className="grid place-items-center">
        <Announcement key={n} titulo={titulo} sub={sub} />
      </div>
      <Button variant="secondary" size="lg" className="w-fit" onClick={() => setN((x) => x + 1)}>
        Próxima finalização
      </Button>
    </div>
  );
}

export function SettingsDemo() {
  const [zona, setZona] = useState(15);
  const [vibrar, setVibrar] = useState(true);
  return (
    <Tabs defaultValue="p1" className="gap-6">
      <TabsList className="h-12 bg-tinta-2 p-1">
        <TabsTrigger value="p1" className="h-10 px-6 text-base data-active:bg-tinta-3 data-active:text-papel">
          Jogador 1
        </TabsTrigger>
        <TabsTrigger value="p2" className="h-10 px-6 text-base data-active:bg-tinta-3 data-active:text-papel">
          Jogador 2
        </TabsTrigger>
      </TabsList>
      {['p1', 'p2'].map((p, i) => (
        <TabsContent key={p} value={p} className="grid max-w-xl gap-8">
          <label className="grid gap-2 text-base font-semibold">
            Controle
            <Select defaultValue={String(i)}>
              <SelectTrigger className="h-11 w-full text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Porta 1 · Wireless Controller (DualShock 4)</SelectItem>
                <SelectItem value="1">Porta 2 · Wireless Controller (DualShock 4)</SelectItem>
                <SelectItem value="k">Só teclado</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-3 text-base font-semibold">
            <span className="flex justify-between">
              Zona morta do analógico <span className="tabular-nums text-texto-2">{zona}%</span>
            </span>
            <Slider value={[zona]} onValueChange={([n]) => setZona(n)} max={60} step={1} aria-label="Zona morta do analógico" />
            <span className="text-sm font-normal text-texto-2">Aumente se a beyblade andar sozinha com o analógico solto.</span>
          </label>
          <label className="flex items-center justify-between gap-6 text-base font-semibold">
            Vibração do controle
            <Switch checked={vibrar} onCheckedChange={setVibrar} />
          </label>
        </TabsContent>
      ))}
    </Tabs>
  );
}

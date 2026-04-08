import React, { ReactNode } from 'react';
import Svg, { G, Circle, Ellipse, Path, Rect, Text as SvgText } from 'react-native-svg';
import { AvatarConfig } from '../../types';

const OUTLINE = '#60463B';
const OUTLINE_LIGHT = '#8A6655';
const BLUSH = '#F7B0A9';
const SHADOW = '#D7CDBF';
const STROKE = 3.2;

interface Props {
  config: AvatarConfig;
  size?: number;
  mode?: 'full' | 'portrait';
}

export function AvatarCharacter({ config, size = 120, mode = 'full' }: Props) {
  const viewBox = mode === 'portrait' ? '22 10 156 164' : '0 0 200 280';
  const aspectRatio = mode === 'portrait' ? 1 : 1.4;
  const skin = soften(config.skinColor, 0.08);
  const hair = soften(config.hairColor, 0.12);
  const hat = soften(config.hatColor, 0.08);
  const top = soften(config.topColor, 0.1);
  const bottom = soften(config.bottomColor, 0.08);
  const shoes = soften(config.shoesColor, 0.06);

  return (
    <Svg width={size} height={size * aspectRatio} viewBox={viewBox}>
      {mode === 'full' && <Ellipse cx={100} cy={258} rx={30} ry={8} fill={SHADOW} opacity={0.45} />}
      {renderHairBack(config.hair, hair)}
      {renderBody(config.top, config.bottom, top, bottom)}
      {renderLeftArm(skin)}
      {renderRightArm(skin)}
      {renderLeftLeg(skin, shoes, config.shoes)}
      {renderRightLeg(skin, shoes, config.shoes)}
      {renderHead(skin)}
      {renderHairFront(config.hair, hair)}
      {renderHat(config.hat, hat)}
      {renderFace(config.face)}
    </Svg>
  );
}

function soften(hex: string, amount: number): string {
  const value = hex.replace('#', '');
  const normalized = value.length === 3
    ? value.split('').map((char) => char + char).join('')
    : value;
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount)
    .toString(16)
    .padStart(2, '0');
  return `#${mix(red)}${mix(green)}${mix(blue)}`;
}

function renderHead(skin: string): ReactNode {
  return (
    <G>
      <Ellipse cx={68} cy={82} rx={6} ry={8} fill={skin} stroke={OUTLINE} strokeWidth={2.3} />
      <Ellipse cx={132} cy={82} rx={6} ry={8} fill={skin} stroke={OUTLINE} strokeWidth={2.3} />
      <Path
        d="M69,86 C69,44 84,26 100,26 C116,26 131,44 131,86 C131,106 118,120 100,120 C82,120 69,106 69,86 Z"
        fill={skin}
        stroke={OUTLINE}
        strokeWidth={STROKE}
      />
      <Path d="M91,114 Q100,118 109,114" stroke={OUTLINE_LIGHT} strokeWidth={1.5} fill="none" opacity={0.25} />
      <Path d="M91,121 L109,121" stroke={OUTLINE_LIGHT} strokeWidth={1.6} strokeLinecap="round" opacity={0.35} />
    </G>
  );
}

function renderLeftArm(skin: string): ReactNode {
  return (
    <G>
      <Path d="M80,146 C61,134 44,125 30,123" stroke={OUTLINE} strokeWidth={7.8} strokeLinecap="round" fill="none" />
      <Path d="M80,146 C61,134 44,125 30,123" stroke={skin} strokeWidth={5.1} strokeLinecap="round" fill="none" />
      <Path d="M30,123 C27,116 18,117 16,124 C18,131 27,132 30,123 Z" fill={skin} stroke={OUTLINE} strokeWidth={2.3} strokeLinejoin="round" />
    </G>
  );
}

function renderRightArm(skin: string): ReactNode {
  return (
    <G>
      <Path d="M120,146 C139,134 156,125 170,123" stroke={OUTLINE} strokeWidth={7.8} strokeLinecap="round" fill="none" />
      <Path d="M120,146 C139,134 156,125 170,123" stroke={skin} strokeWidth={5.1} strokeLinecap="round" fill="none" />
      <Path d="M170,123 C173,116 182,117 184,124 C182,131 173,132 170,123 Z" fill={skin} stroke={OUTLINE} strokeWidth={2.3} strokeLinejoin="round" />
    </G>
  );
}

function renderLeftLeg(skin: string, shoes: string, shoeStyle: string): ReactNode {
  return (
    <G>
      <Path d="M92,198 C78,215 66,229 54,241" stroke={OUTLINE} strokeWidth={8} strokeLinecap="round" fill="none" />
      <Path d="M92,198 C78,215 66,229 54,241" stroke={skin} strokeWidth={5.2} strokeLinecap="round" fill="none" />
      {renderShoe(54, 241, shoes, shoeStyle, -1)}
    </G>
  );
}

function renderRightLeg(skin: string, shoes: string, shoeStyle: string): ReactNode {
  return (
    <G>
      <Path d="M108,198 C121,215 132,229 145,241" stroke={OUTLINE} strokeWidth={8} strokeLinecap="round" fill="none" />
      <Path d="M108,198 C121,215 132,229 145,241" stroke={skin} strokeWidth={5.2} strokeLinecap="round" fill="none" />
      {renderShoe(145, 241, shoes, shoeStyle, 1)}
    </G>
  );
}

function renderShoe(x: number, y: number, color: string, shoeStyle: string, direction: -1 | 1): ReactNode {
  if (shoeStyle === 'boots') {
    return (
      <Path
        d={`M${x - 10},${y - 2} Q${x},${y - 5} ${x + 11},${y - 1} L${x + 9},${y + 10} Q${x},${y + 13} ${x - 11},${y + 10} Z`}
        fill={color}
        stroke={OUTLINE}
        strokeWidth={2.3}
      />
    );
  }

  if (shoeStyle === 'sandals') {
    return (
      <G>
        <Ellipse cx={x} cy={y + 6} rx={10} ry={4.5} fill={color} stroke={OUTLINE} strokeWidth={2} />
        <Path d={`M${x - 5},${y + 3} Q${x},${y - 1} ${x + 5},${y + 3}`} stroke={OUTLINE_LIGHT} strokeWidth={1.7} fill="none" />
      </G>
    );
  }

  return (
    <G>
      <Ellipse cx={x} cy={y + 5} rx={11} ry={5.5} fill={color} stroke={OUTLINE} strokeWidth={2.3} />
      <Path d={`M${x - 5},${y + 2} L${x + 4},${y + 2}`} stroke={OUTLINE_LIGHT} strokeWidth={1.4} strokeLinecap="round" />
      <Circle cx={x + 8 * direction} cy={y + 4} r={1.2} fill={OUTLINE_LIGHT} opacity={0.4} />
    </G>
  );
}

function renderBody(topStyle: string, bottomStyle: string, topColor: string, bottomColor: string): ReactNode {
  if (topStyle === 'dress') {
    return (
      <G>
        <Path d="M79,138 Q88,130 100,130 Q112,130 121,138 L126,157 Q113,165 100,165 Q87,165 74,157 Z" fill={topColor} stroke={OUTLINE} strokeWidth={STROKE} strokeLinejoin="round" />
        <Path d="M73,156 Q100,175 127,156 L140,215 Q100,230 60,215 Z" fill={soften(topColor, 0.05)} stroke={OUTLINE} strokeWidth={STROKE} strokeLinejoin="round" />
        <Path d="M78,176 Q100,188 122,176" stroke={OUTLINE_LIGHT} strokeWidth={1.8} fill="none" opacity={0.4} />
        <Path d="M88,133 Q100,142 112,133" fill={soften('#FFE6D5', 0.1)} stroke={OUTLINE} strokeWidth={2} />
      </G>
    );
  }

  return (
    <G>
      <Path d="M76,138 Q87,130 100,130 Q113,130 124,138 L126,174 Q112,183 100,183 Q88,183 74,174 Z" fill={topColor} stroke={OUTLINE} strokeWidth={STROKE} strokeLinejoin="round" />
      <Path d="M87,133 Q100,143 113,133" fill={soften('#FFE6D5', 0.1)} stroke={OUTLINE} strokeWidth={2} />
      <Path d="M79,150 Q100,160 121,150" stroke={OUTLINE_LIGHT} strokeWidth={1.7} fill="none" opacity={0.35} />
      {renderBottomPiece(bottomStyle, bottomColor)}
    </G>
  );
}

function renderBottomPiece(id: string, color: string): ReactNode {
  if (id === 'skirt') {
    return (
      <G>
        <Path d="M78,180 Q100,188 122,180 L132,212 Q100,224 68,212 Z" fill={color} stroke={OUTLINE} strokeWidth={STROKE} strokeLinejoin="round" />
        <Path d="M84,190 Q100,197 116,190" stroke={OUTLINE_LIGHT} strokeWidth={1.5} fill="none" opacity={0.4} />
      </G>
    );
  }

  if (id === 'shorts') {
    return (
      <G>
        <Path d="M79,179 Q100,185 121,179 L120,202 Q107,207 100,204 Q93,207 80,202 Z" fill={color} stroke={OUTLINE} strokeWidth={STROKE} strokeLinejoin="round" />
        <Path d="M100,184 L100,204" stroke={OUTLINE_LIGHT} strokeWidth={1.6} opacity={0.35} />
      </G>
    );
  }

  return (
    <G>
      <Path d="M80,179 Q100,185 120,179 L115,219 Q107,223 100,221 Q93,223 85,219 Z" fill={color} stroke={OUTLINE} strokeWidth={STROKE} strokeLinejoin="round" />
        <Path d="M100,184 L100,220" stroke={OUTLINE_LIGHT} strokeWidth={1.5} opacity={0.35} />
    </G>
  );
}

function renderHairBack(id: string, color: string): ReactNode {
  if (id === 'long') {
    return (
      <G>
        <Path d="M73,68 C62,86 60,118 69,144 L82,134 L82,74 Z" fill={color} stroke={OUTLINE} strokeWidth={STROKE} />
        <Path d="M127,68 C138,86 140,118 131,144 L118,134 L118,74 Z" fill={color} stroke={OUTLINE} strokeWidth={STROKE} />
      </G>
    );
  }

  if (id === 'ponytail') {
    return (
      <Path d="M128,58 C148,63 158,86 152,115" stroke={OUTLINE} strokeWidth={12} strokeLinecap="round" fill="none" />
    );
  }

  return null;
}

function renderHairFront(id: string, color: string): ReactNode {
  switch (id) {
    case 'buzz':
      return <Path d="M76,72 Q79,34 100,30 Q121,34 124,72 Q100,64 76,72 Z" fill={color} stroke={OUTLINE} strokeWidth={STROKE} />;
    case 'short':
      return (
        <G>
          <Path d="M72,73 Q70,32 100,23 Q130,32 128,73 Q115,64 100,64 Q85,64 72,73 Z" fill={color} stroke={OUTLINE} strokeWidth={STROKE} />
          <Path d="M90,32 Q100,38 111,31" stroke={OUTLINE_LIGHT} strokeWidth={1.7} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'long':
      return <Path d="M71,74 Q69,28 100,20 Q131,28 129,74 Q115,63 100,64 Q85,63 71,74 Z" fill={color} stroke={OUTLINE} strokeWidth={STROKE} />;
    case 'curly':
      return (
        <G>
          <Circle cx={76} cy={42} r={11} fill={color} stroke={OUTLINE} strokeWidth={2.4} />
          <Circle cx={92} cy={28} r={12} fill={color} stroke={OUTLINE} strokeWidth={2.4} />
          <Circle cx={109} cy={28} r={12} fill={color} stroke={OUTLINE} strokeWidth={2.4} />
          <Circle cx={125} cy={42} r={11} fill={color} stroke={OUTLINE} strokeWidth={2.4} />
          <Circle cx={70} cy={60} r={10} fill={color} stroke={OUTLINE} strokeWidth={2.4} />
          <Circle cx={130} cy={60} r={10} fill={color} stroke={OUTLINE} strokeWidth={2.4} />
          <Path d="M73,77 Q72,43 100,42 Q128,43 127,77 Q114,67 100,67 Q86,67 73,77 Z" fill={color} stroke={OUTLINE} strokeWidth={STROKE} />
        </G>
      );
    case 'spiky':
      return (
        <G>
          <Path d="M74,75 Q72,35 100,26 Q128,35 126,75 Q114,64 100,64 Q86,64 74,75 Z" fill={color} stroke={OUTLINE} strokeWidth={STROKE} />
          <Path d="M82,33 L76,12 L93,29 Z" fill={color} stroke={OUTLINE} strokeWidth={2.5} />
          <Path d="M98,25 L101,4 L108,26 Z" fill={color} stroke={OUTLINE} strokeWidth={2.5} />
          <Path d="M114,32 L128,15 L121,35 Z" fill={color} stroke={OUTLINE} strokeWidth={2.5} />
        </G>
      );
    case 'ponytail':
      return (
        <G>
          <Path d="M71,74 Q69,28 100,20 Q131,28 129,74 Q115,63 100,64 Q85,63 71,74 Z" fill={color} stroke={OUTLINE} strokeWidth={STROKE} />
          <Path d="M128,58 C148,63 158,86 152,115" stroke={color} strokeWidth={8} strokeLinecap="round" fill="none" />
          <Circle cx={128} cy={58} r={4} fill={soften('#EBA2C1', 0.12)} stroke={OUTLINE} strokeWidth={1.6} />
        </G>
      );
    case 'pigtails':
      return (
        <G>
          <Circle cx={71} cy={52} r={13} fill={color} stroke={OUTLINE} strokeWidth={2.6} />
          <Circle cx={129} cy={52} r={13} fill={color} stroke={OUTLINE} strokeWidth={2.6} />
          <Path d="M73,74 Q72,30 100,23 Q128,30 127,74 Q114,64 100,64 Q86,64 73,74 Z" fill={color} stroke={OUTLINE} strokeWidth={STROKE} />
          <Circle cx={79} cy={43} r={3.5} fill={soften('#8FD3F4', 0.1)} stroke={OUTLINE} strokeWidth={1.3} />
          <Circle cx={121} cy={43} r={3.5} fill={soften('#8FD3F4', 0.1)} stroke={OUTLINE} strokeWidth={1.3} />
        </G>
      );
    case 'afro':
      return (
        <G>
          <Circle cx={71} cy={44} r={15} fill={color} stroke={OUTLINE} strokeWidth={2.5} />
          <Circle cx={90} cy={28} r={17} fill={color} stroke={OUTLINE} strokeWidth={2.5} />
          <Circle cx={110} cy={28} r={17} fill={color} stroke={OUTLINE} strokeWidth={2.5} />
          <Circle cx={129} cy={44} r={15} fill={color} stroke={OUTLINE} strokeWidth={2.5} />
          <Circle cx={66} cy={67} r={13} fill={color} stroke={OUTLINE} strokeWidth={2.5} />
          <Circle cx={134} cy={67} r={13} fill={color} stroke={OUTLINE} strokeWidth={2.5} />
          <Path d="M73,78 Q73,45 100,43 Q127,45 127,78 Q114,68 100,69 Q86,68 73,78 Z" fill={color} stroke={OUTLINE} strokeWidth={STROKE} />
        </G>
      );
    default:
      return null;
  }
}

function renderFace(id: string): ReactNode {
  switch (id) {
    case 'cool':
      return (
        <G>
          <Rect x={80} y={67} width={16} height={10} rx={4} fill="#5B4E4A" stroke={OUTLINE} strokeWidth={1.8} />
          <Rect x={104} y={67} width={16} height={10} rx={4} fill="#5B4E4A" stroke={OUTLINE} strokeWidth={1.8} />
          <Path d="M96,72 L104,72" stroke={OUTLINE} strokeWidth={1.7} strokeLinecap="round" />
          <Circle cx={79} cy={88} r={5.5} fill={BLUSH} opacity={0.45} />
          <Circle cx={121} cy={88} r={5.5} fill={BLUSH} opacity={0.45} />
          <Path d="M89,95 Q100,104 112,95" stroke={OUTLINE} strokeWidth={2.8} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'silly':
      return (
        <G>
          <Circle cx={87} cy={72} r={3.8} fill={OUTLINE} />
          <Path d="M107,72 Q112,67 118,72" stroke={OUTLINE} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <Circle cx={79} cy={88} r={5.5} fill={BLUSH} opacity={0.45} />
          <Circle cx={121} cy={88} r={5.5} fill={BLUSH} opacity={0.45} />
          <Ellipse cx={100} cy={96} rx={8} ry={5.6} fill={soften('#F48683', 0.1)} stroke={OUTLINE} strokeWidth={2.2} />
          <Ellipse cx={100} cy={99} rx={4.8} ry={2.8} fill={soften('#F86F83', 0.16)} />
        </G>
      );
    case 'surprised':
      return (
        <G>
          <Circle cx={86} cy={72} r={5.8} fill="#FFFDFB" stroke={OUTLINE} strokeWidth={1.9} />
          <Circle cx={86} cy={72} r={2.3} fill={OUTLINE} />
          <Circle cx={114} cy={72} r={5.8} fill="#FFFDFB" stroke={OUTLINE} strokeWidth={1.9} />
          <Circle cx={114} cy={72} r={2.3} fill={OUTLINE} />
          <Path d="M78,63 Q86,58 94,63" stroke={OUTLINE_LIGHT} strokeWidth={1.8} fill="none" />
          <Path d="M106,63 Q114,58 122,63" stroke={OUTLINE_LIGHT} strokeWidth={1.8} fill="none" />
          <Circle cx={100} cy={95} r={5} fill="#FFFDFB" stroke={OUTLINE} strokeWidth={2} />
        </G>
      );
    case 'sleepy':
      return (
        <G>
          <Path d="M81,72 Q87,67 93,72" stroke={OUTLINE} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <Path d="M107,72 Q113,67 119,72" stroke={OUTLINE} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <Circle cx={79} cy={88} r={5.5} fill={BLUSH} opacity={0.35} />
          <Circle cx={121} cy={88} r={5.5} fill={BLUSH} opacity={0.35} />
          <SvgText x={132} y={58} fill="#B39BDF" fontSize={12} fontWeight="700">z</SvgText>
          <SvgText x={139} y={48} fill="#B39BDF" fontSize={9} fontWeight="700">z</SvgText>
          <Path d="M92,96 Q100,92 108,96" stroke={OUTLINE} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'wink':
      return (
        <G>
          <Circle cx={87} cy={72} r={3.8} fill={OUTLINE} />
          <Path d="M107,72 Q113,67 119,72" stroke={OUTLINE} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <Circle cx={79} cy={88} r={5.5} fill={BLUSH} opacity={0.45} />
          <Circle cx={121} cy={88} r={5.5} fill={BLUSH} opacity={0.45} />
          <Path d="M88,95 Q100,106 112,95" stroke={OUTLINE} strokeWidth={2.8} fill="none" strokeLinecap="round" />
        </G>
      );
    default:
      return (
        <G>
          <Circle cx={87} cy={72} r={3.8} fill={OUTLINE} />
          <Circle cx={113} cy={72} r={3.8} fill={OUTLINE} />
          <Circle cx={79} cy={88} r={5.5} fill={BLUSH} opacity={0.45} />
          <Circle cx={121} cy={88} r={5.5} fill={BLUSH} opacity={0.45} />
          <Path d="M88,95 Q100,106 112,95" stroke={OUTLINE} strokeWidth={2.8} fill="none" strokeLinecap="round" />
        </G>
      );
  }
}

function renderHat(id: string, color: string): ReactNode {
  switch (id) {
    case 'cap':
      return (
        <G>
          <Path d="M72,44 Q76,18 100,16 Q124,18 128,44 Q115,39 100,39 Q85,39 72,44 Z" fill={color} stroke={OUTLINE} strokeWidth={2.6} />
          <Path d="M89,41 Q97,49 107,41 Q100,45 87,47" fill={color} stroke={OUTLINE} strokeWidth={2.4} />
        </G>
      );
    case 'beanie':
      return (
        <G>
          <Circle cx={78} cy={42} r={4.6} fill={soften('#8FD3F4', 0.08)} stroke={OUTLINE} strokeWidth={1.5} />
          <Circle cx={87} cy={33} r={4.6} fill={soften('#F6C177', 0.08)} stroke={OUTLINE} strokeWidth={1.5} />
          <Circle cx={100} cy={28} r={4.6} fill={soften('#ECA3B5', 0.08)} stroke={OUTLINE} strokeWidth={1.5} />
          <Circle cx={113} cy={33} r={4.6} fill={soften('#A7D7A6', 0.08)} stroke={OUTLINE} strokeWidth={1.5} />
          <Circle cx={122} cy={42} r={4.6} fill={soften('#D2B8F2', 0.08)} stroke={OUTLINE} strokeWidth={1.5} />
          <Path d="M78,46 Q100,28 122,46" stroke={OUTLINE} strokeWidth={2} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'crown':
      return (
        <G>
          <Path d="M81,44 L87,28 L95,40 L100,23 L105,40 L113,28 L119,44 Z" fill={soften('#F1D06B', 0.12)} stroke={OUTLINE} strokeWidth={2.5} strokeLinejoin="round" />
          <Rect x={81} y={44} width={38} height={10} rx={4} fill={soften('#F1D06B', 0.12)} stroke={OUTLINE} strokeWidth={2.5} />
        </G>
      );
    case 'bow':
      return (
        <G>
          <Path d="M78,42 Q83,25 97,35 Q92,41 97,47 Q83,57 78,42 Z" fill={color} stroke={OUTLINE} strokeWidth={2.4} />
          <Path d="M122,42 Q117,25 103,35 Q108,41 103,47 Q117,57 122,42 Z" fill={color} stroke={OUTLINE} strokeWidth={2.4} />
          <Circle cx={100} cy={41} r={5.8} fill={soften(color, 0.05)} stroke={OUTLINE} strokeWidth={2} />
        </G>
      );
    default:
      return null;
  }
}

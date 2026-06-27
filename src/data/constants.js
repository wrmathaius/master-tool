import * as THREE from 'three'

/**
 * Dados das Skills de RPG com efeitos visuais
 */
export const SKILLS = [
  {
    id: 'fireball',
    name: 'Bola de Fogo',
    icon: '🔥',
    color: '#ff4500',
    emissive: '#ff6347',
    description: '+2d6 dano de fogo',
    particleColor: new THREE.Color(1, 0.3, 0)
  },
  {
    id: 'heal',
    name: 'Cura',
    icon: '💚',
    color: '#32cd32',
    emissive: '#00ff00',
    description: 'Recupera 1d8+3 HP',
    particleColor: new THREE.Color(0, 1, 0)
  },
  {
    id: 'sneak',
    name: 'Ataque Furtivo',
    icon: '🗡️',
    color: '#9370db',
    emissive: '#8a2be2',
    description: '+1d6 dano furtivo',
    particleColor: new THREE.Color(0.5, 0, 1)
  },
  {
    id: 'shield',
    name: 'Escudo Mágico',
    icon: '🛡️',
    color: '#4169e1',
    emissive: '#0000ff',
    description: '+2 AC por 1 minuto',
    particleColor: new THREE.Color(0, 0, 1)
  }
]

/**
 * Tipos de dados disponíveis para rolagem
 */
export const DICE_TYPES = [
  { type: 'd4', faces: 4, label: 'D4' },
  { type: 'd6', faces: 6, label: 'D6' },
  { type: 'd8', faces: 8, label: 'D8' },
  { type: 'd10', faces: 10, label: 'D10' },
  { type: 'd12', faces: 12, label: 'D12' },
  { type: 'd20', faces: 20, label: 'D20' },
  { type: 'd100', faces: 100, label: 'D100' }
]

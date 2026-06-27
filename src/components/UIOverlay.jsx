import React, { useState } from 'react'
import { SKILLS, DICE_TYPES } from '../data/constants'

/**
 * Componente UIOverlay - Interface 2D sobreposta à cena 3D
 * Gerencia: seleção de dados, skills, botão de rolagem e exibição de resultados
 */
export default function UIOverlay({ 
  selectedDice, 
  setSelectedDice, 
  activeSkill, 
  setActiveSkill, 
  onRoll, 
  isRolling,
  lastResult 
}) {
  
  // Handler para selecionar uma skill
  const handleSkillClick = (skill) => {
    // Se clicar na mesma skill, desativa
    if (activeSkill?.id === skill.id) {
      setActiveSkill(null)
    } else {
      setActiveSkill(skill)
    }
  }
  
  return (
    <div className="ui-overlay">
      
      {/* Efeito de vinheta para focar atenção no centro */}
      <div className="vignette"></div>
      
      {/* Display do resultado da última rolagem */}
      {lastResult !== null && (
        <div className="result-display">
          <div className="result-label">Resultado do Dado</div>
          <div className="result-value">{lastResult}</div>
          {activeSkill && (
            <div className="result-skill">
              {activeSkill.icon} {activeSkill.name} ativo!
            </div>
          )}
        </div>
      )}
      
      {/* Botão de rolar dado */}
      <button 
        className="roll-button"
        onClick={onRoll}
        disabled={isRolling}
      >
        {isRolling ? 'Rolando...' : '🎲 Rolar Dado'}
      </button>
      
      {/* Seletor de tipos de dado */}
      <div className="dice-selector">
        {DICE_TYPES.map((dice) => (
          <button
            key={dice.type}
            className={`dice-btn ${selectedDice.type === dice.type ? 'active' : ''}`}
            onClick={() => setSelectedDice(dice)}
            disabled={isRolling}
          >
            {dice.label}
          </button>
        ))}
      </div>
      
      {/* Painel de Skills */}
      <div className="skills-panel">
        <h3 style={{ color: '#f0e6d2', marginBottom: '10px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Skills
        </h3>
        {SKILLS.map((skill) => (
          <div
            key={skill.id}
            className={`skill-item ${activeSkill?.id === skill.id ? 'active' : ''}`}
            onClick={() => handleSkillClick(skill)}
          >
            <div 
              className="skill-icon"
              style={{ 
                boxShadow: activeSkill?.id === skill.id ? `0 0 15px ${skill.color}` : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {skill.icon}
            </div>
            <div className="skill-info">
              <div className="skill-name">{skill.name}</div>
              <div className="skill-desc">{skill.description}</div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  )
}

import { useState } from 'react';

const EXAMPLES = ['APIs', 'Machine Learning', 'DNS', 'Blockchain', 'TCP/IP', 'OAuth 2.0'];

export default function ConceptInput({ onGenerate, disabled }) {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (value.trim()) onGenerate(value.trim());
  };

  return (
    <div className="input-wrapper">
      <form className="concept-form" onSubmit={submit}>
        <input
          className="concept-input"
          type="text"
          placeholder='Try "Explain APIs" or "How does DNS work?"'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          autoFocus
        />
        <button className="generate-btn" type="submit" disabled={disabled || !value.trim()}>
          {disabled ? 'Generating…' : 'Explain it →'}
        </button>
      </form>

      <div className="example-chips">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            className="chip"
            onClick={() => setValue(ex)}
            disabled={disabled}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

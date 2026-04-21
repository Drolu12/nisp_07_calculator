 // Simple, safe-ish evaluator for basic arithmetic
    // Accepts digits, ., + - * / and % (percent handled separately)
    const exprEl = document.getElementById('expr');
    const outEl = document.getElementById('out');
    let expr = '';
    let lastResult = null;

    function render(){
      exprEl.textContent = expr || '\u00A0';
      outEl.textContent = expr ? expr : '0';
    }

    function append(val){
      // avoid multiple leading zeros or multiple dots in a number segment
      if (val === '.') {
        // find last number segment
        const seg = expr.split(/[\+\-\*\/]/).pop();
        if (seg.includes('.')) return;
        if (seg === '') expr += '0';
      }
      expr += val;
      render();
    }

    function clearAll(){
      expr = '';
      lastResult = null;
      render();
    }

    function toggleNeg(){
      // toggle sign of last number segment
      const parts = expr.split(/([+\-*/])/);
      if (parts.length === 0) return;
      let last = parts.pop();
      if (last === '') return;
      if (last.startsWith('(-') && last.endsWith(')')){
        last = last.slice(2,-1);
      } else {
        last = '(-' + last + ')';
      }
      parts.push(last);
      expr = parts.join('');
      render();
    }

    function percent(){
      // convert last number segment to percentage (divide by 100)
      const parts = expr.split(/([+\-*/])/);
      let last = parts.pop();
      if (last === '') return;
      // remove wrapping parentheses from neg handling
      if (last.startsWith('(-') && last.endsWith(')')) last = '-' + last.slice(2,-1);
      const n = parseFloat(last);
      if (!isFinite(n)) return;
      parts.push(String(n / 100));
      expr = parts.join('');
      render();
    }

    function evaluateExpression(){
      if (!expr) return;
      // Replace unicode minus signs and multiplication/division if present
      const safe = expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/\s+/g,'');
      try {
        // Disallow letters etc.
        if (/[^0-9\.\+\-\*\/\(\)\s]/.test(safe)) throw new Error('Invalid');
        // Use Function to evaluate; this is simple and sufficient for basic calculator
        const val = Function('"use strict"; return (' + safe + ')')();
        if (!isFinite(val)) throw new Error('Math error');
        lastResult = val;
        expr = String(val);
        render();
      } catch (e){
        outEl.textContent = 'Error';
        expr = '';
        lastResult = null;
      }
    }

    document.getElementById('keys').addEventListener('click', (ev) => {
      const btn = ev.target.closest('button');
      if (!btn) return;
      const v = btn.dataset.value;
      const action = btn.dataset.action;
      if (action === 'clear') { clearAll(); return; }
      if (action === 'neg') { toggleNeg(); return; }
      if (action === 'percent') { percent(); return; }
      if (action === 'equals') { evaluateExpression(); return; }
      if (v) append(v);
    });

    // keyboard support
    window.addEventListener('keydown', (e) => {
      const k = e.key;
      if (/^[0-9]$/.test(k)){ append(k); e.preventDefault(); return; }
      if (k === '.') { append('.'); e.preventDefault(); return; }
      if (k === 'Enter' || k === '='){ evaluateExpression(); e.preventDefault(); return; }
      if (k === 'Backspace'){ expr = expr.slice(0,-1); render(); e.preventDefault(); return; }
      if (k === 'Escape'){ clearAll(); e.preventDefault(); return; }
      if (['+','-','*','/'].includes(k)){ append(k); e.preventDefault(); return; }
      if (k === '%'){ percent(); e.preventDefault(); return; }
    });

    // initial render
    render();
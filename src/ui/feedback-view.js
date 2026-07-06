// Player feedback form. Submits to FormSubmit.co, which emails each entry to
// the configured inbox — no account or backend needed. Players don't sign in.
// The endpoint uses FormSubmit's random-string alias so the destination email
// address never appears in this public source.

const ENDPOINT = 'https://formsubmit.co/ajax/357d3d8722a7a570828aed66f5a6a112';

const STAR_PATH = 'M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.3l6.5-.9z';

function starButton(index, onPick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'star';
    b.dataset.index = String(index);
    b.setAttribute('aria-label', `${index} 星`);
    b.innerHTML =
        `<svg viewBox="0 0 24 24" width="30" height="30"><path d="${STAR_PATH}"/></svg>`;
    b.addEventListener('click', () => onPick(index));
    return b;
}

export function createFeedbackView(container, opts) {
    function render() {
        container.innerHTML = '';
        let rating = 0;

        const header = document.createElement('div');
        header.className = 'enc-head';
        const back = document.createElement('button');
        back.className = 'btn-ghost';
        back.textContent = '‹ 選單';
        back.addEventListener('click', () => opts.onBack());
        const title = document.createElement('h2');
        title.textContent = '意見回饋';
        header.append(back, title);

        const blurb = document.createElement('p');
        blurb.className = 'fb-blurb';
        blurb.textContent = '喜歡 Demi 數獨嗎？有任何想法、建議或遇到的問題，都直接告訴我！';

        const stars = document.createElement('div');
        stars.className = 'fb-stars';
        const starEls = [];
        for (let i = 1; i <= 5; i++) {
            const b = starButton(i, (picked) => {
                rating = picked;
                starEls.forEach((el, idx) => el.classList.toggle('on', idx < picked));
            });
            starEls.push(b);
            stars.appendChild(b);
        }

        const textarea = document.createElement('textarea');
        textarea.className = 'fb-text';
        textarea.rows = 5;
        textarea.placeholder = '寫下你的留言…';

        const contact = document.createElement('input');
        contact.className = 'fb-contact';
        contact.type = 'text';
        contact.placeholder = '稱呼或 email（選填，方便回覆你）';

        const submit = document.createElement('button');
        submit.className = 'btn primary fb-submit';
        submit.textContent = '送出';

        const status = document.createElement('p');
        status.className = 'fb-status';

        submit.addEventListener('click', async () => {
            const message = textarea.value.trim();
            if (!message) {
                status.textContent = '請先寫一點留言再送出。';
                status.className = 'fb-status err';
                return;
            }
            submit.disabled = true;
            status.textContent = '送出中…';
            status.className = 'fb-status';
            try {
                const res = await fetch(ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({
                        留言: message,
                        評分: rating ? `${rating} / 5` : '（未評分）',
                        聯絡方式: contact.value.trim() || '（未填）',
                        版本: opts.appVersion,
                        _subject: 'Demi 數獨 玩家回饋',
                        _template: 'table',
                        _captcha: 'false',
                    }),
                });
                if (!res.ok) throw new Error('bad status');
                container.innerHTML = '';
                const thanks = document.createElement('div');
                thanks.className = 'fb-thanks';
                const h = document.createElement('h2');
                h.textContent = '感謝你的回饋！';
                const p = document.createElement('p');
                p.textContent = '你的留言已送出，我會看到的。';
                const home = document.createElement('button');
                home.className = 'btn primary';
                home.textContent = '回選單';
                home.addEventListener('click', () => opts.onBack());
                thanks.append(h, p, home);
                container.append(header, thanks);
            } catch {
                submit.disabled = false;
                status.textContent = '送出失敗，請檢查網路後再試一次。';
                status.className = 'fb-status err';
            }
        });

        const form = document.createElement('div');
        form.className = 'fb-form';
        form.append(stars, textarea, contact, submit, status);

        container.append(header, blurb, form);
    }

    return { render };
}

import re, sys
NB = ' '
ONE = r'[ksvzouaiKSVZOUAI]'
mid = re.compile(r'(^|[\s(„“"])(' + ONE + r') (?=\S)')
end = re.compile(r'(^|[\s(„])(' + ONE + r') $')
num = re.compile(r'(\d) (minut|min|dny|dní|den|hodin|lidí|pokusů|pokusy|pokus|ze)\b')
def fix(t):
    prev = None
    while prev != t:
        prev = t
        t = mid.sub(lambda m: m.group(1) + m.group(2) + NB, t)
    t = end.sub(lambda m: m.group(1) + m.group(2) + NB, t)
    t = num.sub(lambda m: m.group(1) + NB + m.group(2), t)
    return t
count = 0
def html(path):
    global count
    s = open(path, encoding='utf-8').read()
    parts = re.split(r'(<[^>]+>)', s)
    out = []
    in_svg = 0
    for p in parts:
        if p.startswith('<'):
            out.append(p); continue
        n = fix(p); count += (n != p); out.append(n)
    open(path, 'w', encoding='utf-8').write(''.join(out))
lit = re.compile(r"'(?:[^'\\\n]|\\.)*'")
def js(path):
    global count
    s = open(path, encoding='utf-8').read()
    def f(m):
        global count
        body = m.group(0)[1:-1]
        if not re.search('[áčďéěíňóřšťúůýž]|[A-Za-z]{3,} [a-z]', body):   # jen české věty, ne kód
            return m.group(0)
        n = fix(body); count += (n != body)
        return "'" + n + "'"
    s2 = lit.sub(f, s)
    open(path, 'w', encoding='utf-8').write(s2)
for p in sys.argv[1:]:
    (html if p.endswith('.html') else js)(p)
print('changed segments', count)

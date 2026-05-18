import fs from 'fs';

const p = 'src/app/schedule/page.tsx';
let c = fs.readFileSync(p, 'utf8');

if (!c.includes('href={`/session/${s._id}`}')) {
  c = c.replace(
    `<div key={s._id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100">`,
    `<Link
                        key={s._id}
                        href={\`/session/\${s._id}\`}
                        className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/50 dark:border-slate-700 dark:hover:border-sky-800 dark:hover:bg-sky-950/30 transition no-underline"
                      >`
  );
  c = c.replace(
    `                        </div>
                      </motion-safe:REMOVE
                      </div>
                    ))}`,
    `                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      </Link>
                    ))}`
  );
  c = c.replace(
    `                        </div>
                      </div>
                    ))}`,
    `                        </motion-safe:REMOVE
                        </motion-safe:REMOVE
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      </Link>
                    ))}`
  );
}

c = c.replace(/<\/?motion-safe:REMOVE/g, '');

// Page title: Activity
c = c.replace(
  `<span className="font-medium text-slate-700 dark:text-slate-200">{tr('schedule')}</span>`,
  `<span className="font-medium text-slate-700 dark:text-slate-200">{tr('activity')}</span>`
);
c = c.replace(
  `<h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{tr('schedule')}</h1>`,
  `<h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{tr('activity')}</h1>`
);
c = c.replace(
  `{tr('schedulePageLead')}`,
  `{tr('activityPageLead')}`
);

fs.writeFileSync(p, c);
console.log('schedule patched', c.includes('href={`/session/'));

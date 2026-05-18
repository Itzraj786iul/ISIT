import fs from 'fs';

const p = 'src/app/organization/page.tsx';
let c = fs.readFileSync(p, 'utf8');

const joinBlock = `function joinRefNames(refs: TeacherRow['assigned_classes'] | undefined): string {
  if (!Array.isArray(refs) || refs.length === 0) return '—';
  const names = refs.map((r) => (r && typeof r.name === 'string' ? r.name : null)).filter(Boolean) as string[];
  return names.length ? names.join(', ') : '—';
}`;

if (!c.includes('function studentClassName')) {
  c = c.replace(
    joinBlock,
    `${joinBlock}

function studentClassName(row: { class_id?: { _id?: string; name?: string } | string | null }): string {
  const cls = row.class_id;
  if (!cls) return '—';
  if (typeof cls === 'object' && cls && typeof cls.name === 'string') return cls.name;
  return '—';
}`
  );
}

if (!c.includes('const isAdmin =')) {
  c = c.replace(
    '  return (\n    <TeacherShell user={user}>',
    "  const isAdmin = user?.role?.toLowerCase() === 'admin';\n\n  return (\n    <TeacherShell user={user}>"
  );
}

if (!c.includes('{/* Students */}')) {
  const studentsBlock = fs.readFileSync('scripts/org-students-block.txt', 'utf8');
  c = c.replace('        {/* Teachers */}', studentsBlock + '        {/* Teachers */}');
}

if (!c.includes('{isAdmin && (\n              <form onSubmit={addClass}')) {
  c = c.replace(
    '              <form onSubmit={addClass} className="flex gap-2">',
    '              {isAdmin && (\n              <form onSubmit={addClass} className="flex gap-2">'
  );
  c = c.replace(
    '              </form>\n\n              {loadingClasses ? (',
    '              </form>\n              )}\n\n              {loadingClasses ? ('
  );
}

const delClassBtn =
  '                          <button\n                            type="button"\n                            onClick={() => deleteClass(c._id)}';
if (c.includes(delClassBtn) && !c.includes('{isAdmin && (\n                          <button\n                            type="button"\n                            onClick={() => deleteClass')) {
  c = c.replace(delClassBtn, `{isAdmin && (
${delClassBtn}`);
  c = c.replace(
    `                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
              <h2 className="font-bold text-slate-800 dark:text-slate-100">
                Subjects`,
    `                          </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion-safe:REMOVE
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
              <h2 className="font-bold text-slate-800 dark:text-slate-100">
                Subjects`
  );
}

c = c.replace(/\s*<\/motion-safe:REMOVE\s*\n/g, '\n').replace(/^\s*<motion-safe:REMOVE\s*\n/gm, '');

if (!c.includes('{isAdmin && selectedClassId && (')) {
  c = c.replace(
    '              {selectedClassId && (\n                <>\n                  <form onSubmit={addSubject}',
    '              {isAdmin && selectedClassId && (\n                <>\n                  <form onSubmit={addSubject}'
  );
}

const delSubBtn =
  '                          <button\n                            type="button"\n                            onClick={() => deleteSubject(s._id)}';
if (c.includes(delSubBtn) && !c.includes('{isAdmin && (\n                          <button\n                            type="button"\n                            onClick={() => deleteSubject')) {
  c = c.replace(delSubBtn, `{isAdmin && (
${delSubBtn}`);
  c = c.replace(
    `                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Students */}`,
    `                          </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Students */}`
  );
}

const addTeacherHdr = '              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Add teacher</h3>';
if (c.includes(addTeacherHdr) && !c.includes('{isAdmin && (\n            <div>\n              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Add teacher')) {
  c = c.replace(
    '            <div>\n              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Add teacher</h3>',
    '            {isAdmin && (\n            <div>\n              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Add teacher</h3>'
  );
}

fs.writeFileSync(p, c);
console.log('done');

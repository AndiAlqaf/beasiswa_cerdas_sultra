const fs = require('fs');
const file = 'src/app/register/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr1 = '{/* STEP 2: FOTO SELFIE / VERIFIKASI WAJAH */}';
const targetStr2 = '{/* STEP 3: DATA DIRI */}';

const startIndex = content.indexOf(targetStr1);
const endIndex = content.indexOf(targetStr2);

if (startIndex === -1 || endIndex === -1) {
  console.log('Target strings not found');
  process.exit(1);
}

const replacement = `{/* STEP 2: FOTO SELFIE / VERIFIKASI WAJAH */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Foto Selfie (Verifikasi Wajah)
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Verifikasi identitas fisik secara langsung melalui liveness detection.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center">
                  {!readyToSelfie && (
                    <>
                      <div className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-sm" />
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          {/* Header */}
                          <div className="bg-slate-50 p-6 flex items-center gap-4 border-b border-slate-100">
                            <div className="w-12 h-12 rounded-2xl bg-[#0B3A6A]/10 flex items-center justify-center shrink-0 shadow-inner">
                              <Camera className="w-6 h-6 text-[#0B3A6A]" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-800">Verifikasi Keaktifan Wajah</h3>
                              <p className="text-xs text-slate-500 mt-0.5">Ikuti panduan berikut agar proses pendaftaran berjalan lancar.</p>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="p-6 space-y-5">
                            {/* Liveness Steps Banner */}
                            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
                              <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Tahapan Verifikasi</h4>
                              <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex flex-col items-center">
                                  <span className="bg-[#0B3A6A]/10 text-[#0B3A6A] font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs mb-1">1</span>
                                  <span className="text-xs font-semibold text-slate-700">Posisikan Wajah</span>
                                  <span className="text-[10px] text-slate-400 mt-0.5">Pas di dalam garis panduan</span>
                                </div>
                                <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex flex-col items-center">
                                  <span className="bg-[#0B3A6A]/10 text-[#0B3A6A] font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs mb-1">2</span>
                                  <span className="text-xs font-semibold text-slate-700">Kedip & Hadap Samping</span>
                                  <span className="text-[10px] text-slate-400 mt-0.5">Kedip, lalu tengok kanan/kiri</span>
                                </div>
                                <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex flex-col items-center">
                                  <span className="bg-emerald-600/10 text-emerald-600 font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs mb-1">3</span>
                                  <span className="text-xs font-semibold text-slate-700">Tersenyum</span>
                                  <span className="text-[10px] text-slate-400 mt-0.5">Foto terambil otomatis</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* DOs */}
                              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                                <h4 className="flex items-center gap-2 text-emerald-800 font-bold mb-3 text-sm">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Boleh (Dianjurkan)
                                </h4>
                                <ul className="space-y-2">
                                  <li className="text-xs text-emerald-700 flex items-start gap-1.5">
                                    <span className="text-emerald-500 font-bold shrink-0">✔</span>
                                    <span>Gunakan pakaian rapi dan berkerah resmi.</span>
                                  </li>
                                  <li className="text-xs text-emerald-700 flex items-start gap-1.5">
                                    <span className="text-emerald-500 font-bold shrink-0">✔</span>
                                    <span>Posisi wajah tegak lurus menghadap kamera.</span>
                                  </li>
                                  <li className="text-xs text-emerald-700 flex items-start gap-1.5">
                                    <span className="text-emerald-500 font-bold shrink-0">✔</span>
                                    <span>Pencahayaan ruangan cukup terang dan merata.</span>
                                  </li>
                                </ul>
                              </div>

                              {/* DONTs */}
                              <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4">
                                <h4 className="flex items-center gap-2 text-rose-800 font-bold mb-3 text-sm">
                                  <XCircle className="w-5 h-5 text-rose-600" /> Tidak Boleh
                                </h4>
                                <ul className="space-y-2">
                                  <li className="text-xs text-rose-700 flex items-start gap-1.5">
                                    <span className="text-rose-500 font-bold shrink-0">✖</span>
                                    <span>Menggunakan kacamata hitam, masker, atau penutup wajah.</span>
                                  </li>
                                  <li className="text-xs text-rose-700 flex items-start gap-1.5">
                                    <span className="text-rose-500 font-bold shrink-0">✖</span>
                                    <span>Mengambil foto dari layar HP lain atau foto cetak.</span>
                                  </li>
                                  <li className="text-xs text-rose-700 flex items-start gap-1.5">
                                    <span className="text-rose-500 font-bold shrink-0">✖</span>
                                    <span>Posisi kepala miring atau keluar dari batas area.</span>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Garis Bantu Warning & Checkbox Agreement */}
                            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-3 mt-4">
                              <p className="text-xs text-amber-800 font-medium leading-relaxed flex items-start gap-2">
                                <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                                <span>
                                  <strong>PENTING:</strong> Wajah Anda wajib diposisikan pas di dalam <strong>Garis Bantu (Siluet)</strong> yang muncul di kamera nanti. Jika posisi wajah melenceng atau keluar garis bantu, sistem AI tidak akan merespons atau gagal melakukan deteksi liveness.
                                </span>
                              </p>
                              <label className="flex items-start gap-2.5 pt-3 border-t border-amber-200/50 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={guideChecked}
                                  onChange={(e) => setGuideChecked(e.target.checked)}
                                  className="rounded text-[#0B3A6A] focus:ring-[#0B3A6A] w-4.5 h-4.5 mt-0.5 shrink-0"
                                />
                                <span className="text-xs font-semibold text-slate-700 leading-snug">
                                  Saya memahami bahwa wajah harus disesuaikan dengan siluet garis bantu agar sistem deteksi wajah dapat mengenali saya.
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col items-center gap-3">
                            {modelLoadError ? (
                              <div className="w-full space-y-3">
                                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-4 leading-relaxed font-medium">
                                  <p className="font-bold mb-1 flex items-center gap-1.5 text-sm text-rose-700">
                                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                    Gagal Memuat Model AI
                                  </p>
                                  {modelLoadError}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setRetryCount(prev => prev + 1)}
                                    className="px-6 py-3 bg-[#0B3A6A] hover:bg-[#082a4d] text-white flex-1 text-sm rounded-xl font-semibold shadow-md"
                                  >
                                    Coba Lagi
                                  </button>
                                  <button
                                    onClick={() => {
                                      setIsBypassed(true);
                                      setFaceModelLoaded(true);
                                      setReadyToSelfie(true);
                                    }}
                                    className="px-4 py-3 border border-slate-300 text-slate-600 rounded-xl text-xs font-semibold"
                                  >
                                    Lewati (Gunakan Kamera Biasa)
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => setReadyToSelfie(true)}
                                  disabled={!faceModelLoaded || !guideChecked}
                                  className="w-full py-3.5 bg-[#0B3A6A] hover:bg-[#082a4d] text-white rounded-xl text-base font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  {!faceModelLoaded ? (
                                    <span className="flex items-center justify-center gap-2">
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                      Memuat sistem deteksi wajah...
                                    </span>
                                  ) : (
                                    'Saya Sudah Siap Foto'
                                  )}
                                </button>
                                {!faceModelLoaded && (
                                  <p className="text-[11px] text-slate-400 text-center">Harap tunggu, model AI sedang diunduh dan diproses...</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {!capturedImage ? (
                    <div className="relative w-full max-w-sm aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden shadow-inner ring-4 ring-slate-100">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      
                      {/* Overlay Silhouette */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-60">
                        <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0" preserveAspectRatio="none">
                          <path d="M50 15 C35 15 25 30 25 50 C25 70 35 75 50 75 C65 75 75 70 75 50 C75 30 65 15 50 15 Z" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" />
                          <path d="M15 100 C15 85 30 80 50 80 C70 80 85 85 85 100" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" />
                        </svg>
                      </div>

                      {isCameraActive && !isBypassed && (
                        <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center pointer-events-none">
                          <div className={\`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 transition-all duration-300 \${livenessStatus === 'searching' ? 'bg-orange-500 text-white animate-bounce' :
                            livenessStatus === 'detected' ? 'bg-indigo-600 text-white animate-pulse' :
                              livenessStatus === 'smiling' ? 'bg-emerald-600 text-white animate-pulse' :
                                'bg-blue-600 text-white animate-pulse'
                            }\`}>
                            {livenessStatus === 'searching' && (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Mencari Wajah...</>
                            )}
                            {livenessStatus === 'detected' && (
                              <>👁 Silakan KEDIPKAN MATA</>
                            )}
                            {livenessStatus === 'right' && (
                              <>👉 Silakan HADAP KANAN</>
                            )}
                            {livenessStatus === 'left' && (
                              <>👈 Silakan HADAP KIRI</>
                            )}
                            {livenessStatus === 'smiling' && (
                              <><CheckCircle2 className="w-4 h-4 text-white animate-pulse" /> 😊 Silakan TERSENYUM</>
                            )}
                          </div>
                        </div>
                      )}

                      {isCameraActive && isBypassed && (
                        <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center z-10">
                          <button
                            onClick={capturePhoto}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2 rounded-full font-semibold pointer-events-auto transition-transform hover:scale-105"
                          >
                            <Camera className="w-4 h-4" /> Ambil Foto Sekarang
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full max-w-sm aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden shadow-inner ring-4 ring-slate-100">
                      <img
                        src={capturedImage}
                        alt="Hasil Foto Selfie"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between p-6">
                        <button
                          onClick={() => {
                            setCapturedImage(null);
                            startCamera();
                          }}
                          className="px-4 py-2 border border-white/30 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-md text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" /> Ulangi
                        </button>
                      </div>
                    </div>
                  )}

                  {(isCameraActive || capturedImage) && (
                    <div className="max-w-sm w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-2.5 items-start mt-4 shadow-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-xs text-amber-800">⚠ Peringatan Anti-Pemalsuan Foto</p>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Sistem mendeteksi dan memblokir wajah dari foto cetak/layar HP. Segala bentuk pemalsuan akan mengakibatkan <strong>diskualifikasi permanen</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {cameraError && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 max-w-sm">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{cameraError}</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      stopCamera();
                    }}
                    className="py-3.5 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Kembali
                  </button>
                  <button
                    type="button"
                    disabled={!capturedImage}
                    onClick={() => {
                      validateAndNextStep();
                      stopCamera();
                    }}
                    className="py-3.5 px-6 bg-[#0B3A6A] hover:bg-[#082a4d] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    Lanjut Isi Data Diri <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            `;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync(file, content);
console.log('done replacing UI');

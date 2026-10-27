-- ================================================================
-- BACKUP DATABASE BEASISWA STIMULAN SULTRA CERDAS 2026
-- Timestamp: 20261027_153254 (2026-10-27T08:32:54.466Z)
-- Database: beasiswa_sultra_cerdas
-- ================================================================

SET FOREIGN_KEY_CHECKS = 0;

--
-- Struktur tabel `applications`
--
DROP TABLE IF EXISTS `applications`;
CREATE TABLE `applications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `registration_no` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('TERKIRIM','PERLU_UNGGAH_ULANG','VERIFIKASI_BERKAS','SELEKSI_ADMINISTRASI','DITERIMA','DITOLAK','PENCAIRAN_TERMIN_1','PENCAIRAN_TERMIN_2') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TERKIRIM',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `submitted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `verified_at` datetime DEFAULT NULL,
  `verified_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `announcement_email_sent_at` datetime DEFAULT NULL,
  `appeal_email_sent_at` datetime DEFAULT NULL,
  `is_lulus_sanggah` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_applications_user_id` (`user_id`),
  UNIQUE KEY `idx_applications_registration_no` (`registration_no`),
  KEY `idx_applications_status` (`status`),
  KEY `verified_by` (`verified_by`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data tabel `applications` (1 baris)
--
INSERT INTO `applications` (`id`, `user_id`, `registration_no`, `status`, `notes`, `submitted_at`, `verified_at`, `verified_by`, `announcement_email_sent_at`, `appeal_email_sent_at`, `is_lulus_sanggah`) VALUES
('71e5d79d-48ac-45dc-9236-eed8c7d222ff', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'BSSC-2026-S1-0001', 'DITERIMA', '- Transkrip Nilai buram, terpotong, atau tidak terbaca dengan jelas.\n- Surat Keterangan Aktif Kuliah / KTM tidak valid atau belum disahkan pejabat berwenang.', '2026-10-19 04:09:16', '2026-10-19 04:11:31', 'f24aa3d6-027f-43af-ac2b-69cdfbe61394', NULL, NULL, 0);

--
-- Struktur tabel `audit_logs`
--
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `request_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_user_id` (`user_id`),
  KEY `idx_audit_logs_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data tabel `audit_logs` (53 baris)
--
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `ip_address`, `user_agent`, `details`, `request_id`, `created_at`) VALUES
('219cc82c-6f43-49f5-ae73-c796576375bf', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'FILE_UPLOADED', '::1', NULL, '{"docType":"ktp","originalName":"download.jpg","storedName":"da90b77f-8c7a-4d28-aab2-920140a0efd0.jpg","mimeType":"image/jpeg","size":130028,"isAppealState":true}', 'b3742856-436d-4886-81a0-5b786fb86394', '2026-10-19 04:10:22'),
('27443aaa-ad73-4479-8352-89dffaac923f', '73548a22-f581-4f86-97db-4430a23c5278', 'FILE_UPLOADED', '::1', NULL, '{"docType":"ktm","originalName":"PROJECT DEFINITION RAFFI.pdf","storedName":"c0cbdcd0-7144-4022-944b-9811f06ac389.pdf","mimeType":"application/pdf","size":146642,"isAppealState":false}', 'c5bafe57-606d-4031-acab-83938f33bc06', '2026-09-30 22:41:55'),
('308f9309-7b08-4a32-b25f-c400f91110ef', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'FILE_UPLOADED', '::1', NULL, '{"docType":"surat_pernyataan","originalName":"LAMPIRAN LOGBOOK AGUSTUS.pdf","storedName":"511e1ed5-3af1-437b-b6aa-cef22be616a0.pdf","mimeType":"application/pdf","size":142987,"isAppealState":false}', 'e9268594-9177-47f8-aef3-abf194704a96', '2026-10-19 04:08:58'),
('32dca424-ae83-4aae-8981-553b6d157c74', 'a32daad7-a8cd-49ac-bcb7-8aa674f62930', 'EDUCATION_UPDATED', '127.0.0.1', NULL, '{"count":3}', 'test', '2026-10-04 18:13:40'),
('35914ba7-e2c2-496a-8aee-4291176af255', 'f24aa3d6-027f-43af-ac2b-69cdfbe61394', 'LOGIN_SUCCESS', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'null', '1fd78d07-8781-4ee4-8a54-8618ed2afadc', '2026-10-19 04:00:26'),
('36547a8e-48ce-47d3-bee4-0b6c79718c49', 'b72e0393-1913-4b1f-8352-9d4e376c6227', 'PROFILE_UPDATED', '127.0.0.1', NULL, 'null', 'test', '2026-10-04 18:13:40'),
('37b496cb-6fff-4588-bab1-51f113d656f8', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'REGISTER_SUCCESS', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{"email":"test@gmail.com","jenjangTarget":"S1"}', '93bc70fe-a15c-4691-8af2-72bcaea6115f', '2026-10-19 04:07:54'),
('3cf36571-3c38-40e8-ac32-8fd61ba8441a', 'f24aa3d6-027f-43af-ac2b-69cdfbe61394', 'LOGIN_SUCCESS', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'null', '503f7ea8-7fe9-411e-8a19-72f75293ee07', '2026-10-19 04:42:52'),
('3dbb9097-874d-4fcf-843f-3707f45873c4', '73548a22-f581-4f86-97db-4430a23c5278', 'REGISTER_SUCCESS', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '{"email":"test1@gmail.com","jenjangTarget":"S1"}', '2ad88fb8-dacd-4c34-b36b-001e8b492f7d', '2026-09-30 22:41:20'),
('4ac31c20-9186-4eb0-945c-1ea2f86010d2', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'PROFILE_UPDATED', '::1', NULL, 'null', '54852ff8-d9d2-44e6-8b6b-eee4bf425d16', '2026-10-19 04:09:16'),
('4c86ea35-83d5-4a2b-8583-531e35a56a98', '73548a22-f581-4f86-97db-4430a23c5278', 'LOGIN_FAILED', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'null', '3359af49-20b3-4b16-9b24-c7676b82d64d', '2026-10-19 04:00:41'),
('4f80ed29-9cae-49f8-b31f-baf6f3a3be5f', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'FILE_UPLOADED', '::1', NULL, '{"docType":"ktm","originalName":"download (1).jpg","storedName":"ec004777-ceab-4622-adbd-63a72fff8db4.jpg","mimeType":"image/jpeg","size":114690,"isAppealState":false}', '19d6e75d-59fb-4e15-88e9-0a08e844dce9', '2026-10-19 04:07:54'),
('55a6f7ce-985a-4adf-b563-f057c6bb9958', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'FILE_UPLOADED', '::1', NULL, '{"docType":"dtks","originalName":"INTECHREST KE PT BOSOWA.pdf","storedName":"2f9a0065-327e-4d10-9399-9c0ad66f6366.pdf","mimeType":"application/pdf","size":750563,"isAppealState":false}', '5b2da642-0ecb-4310-826a-1fc920d27d07', '2026-10-19 04:09:05'),
('569de9af-bc75-491b-b3cc-ae9327d1a80b', 'b72e0393-1913-4b1f-8352-9d4e376c6227', 'EDUCATION_UPDATED', '127.0.0.1', NULL, '{"count":2}', 'test', '2026-10-04 18:13:40'),
('5fdeee32-3859-41fc-8873-8146e05784ed', 'b72e0393-1913-4b1f-8352-9d4e376c6227', 'EDUCATION_UPDATED', '127.0.0.1', NULL, '{"count":2}', 'test', '2026-10-04 18:13:40'),
('65649428-8f10-4ae0-bb39-34e3c965ff41', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'LOGIN_SUCCESS', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'null', 'a110d409-82e4-45c6-ab33-d6d6b95adab3', '2026-10-19 04:11:47'),
('657b11ce-93c2-47ca-a42f-ca3faed7b9c4', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'APPLICATION_SUBMITTED', '::1', NULL, '{"registrationNo":"BSSC-2026-S1-0001"}', 'f75adb82-d4d2-436d-aa2c-126e0dc613fd', '2026-10-19 04:09:16'),
('672fc819-f454-444b-969f-497729b7e973', 'f24aa3d6-027f-43af-ac2b-69cdfbe61394', 'APPLICATION_STATUS_UPDATED', '::1', NULL, '{"applicantUserId":"be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf","oldStatus":"TERKIRIM","newStatus":"DITOLAK","notes":"- Dokumen Kartu Tanda Penduduk (KTP) / KK tidak sesuai dengan domisili Sultra.\\n- Dokumen persyaratan utama (Surat Pernyataan / Esai) tidak dilampirkan."}', '52018012-1083-4ce6-bad3-5996501ec5aa', '2026-10-19 04:09:32'),
('6981a311-4869-4678-9450-db2df6210fac', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'LOGIN_SUCCESS', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'null', '7529e3ac-ebfa-4e72-bb70-79fca4e1f653', '2026-10-19 04:09:46'),
('72fe2252-c197-4b73-9ca2-c0562cdbbff9', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'APPLICATION_APPEALED', '::1', NULL, '{"registrationNo":"BSSC-2026-S1-0001","appealNotes":"sdh ya kami perbaiki"}', 'c3c6d549-b66f-4a11-b839-4272840aa05d', '2026-10-19 04:10:45'),
('742805ed-ba7e-403b-8fd1-6078e89efcd4', '73548a22-f581-4f86-97db-4430a23c5278', 'EDUCATION_UPDATED', '::1', NULL, '{"count":1}', '2fdcfcef-87b2-411f-aed9-4260d6ddb494', '2026-09-30 22:41:55'),
('752d4234-10cb-4c7d-8b00-88df006e58d7', '73548a22-f581-4f86-97db-4430a23c5278', 'FILE_UPLOADED', '::1', NULL, '{"docType":"selfie","originalName":"selfie.webp","storedName":"2995ecd6-536c-4c61-8bb7-0e9e52ee7fe0.webp","mimeType":"image/webp","size":8746,"isAppealState":false}', 'ac85e84d-fd2f-4a45-8e20-cbc1a29664cb', '2026-09-30 22:41:55'),
('7a7aff52-9f06-41ca-8221-9c4aa650c27e', 'f24aa3d6-027f-43af-ac2b-69cdfbe61394', 'LOGIN_SUCCESS', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'null', '6ed94ca7-a623-448e-a677-ac2aaf7120b8', '2026-10-19 04:10:57'),
('7ba63b42-0f5e-4203-90c4-20daca679106', 'a32daad7-a8cd-49ac-bcb7-8aa674f62930', 'PROFILE_UPDATED', '127.0.0.1', NULL, 'null', 'test', '2026-10-04 18:13:40'),
('80b7e6cf-40c0-406f-9e44-6194c0b1c703', '73548a22-f581-4f86-97db-4430a23c5278', 'LOGIN_FAILED', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'null', 'bc69af77-3842-476b-80da-ebc708d30704', '2026-10-19 04:00:52'),
('8549345d-f5f3-4b68-9d9f-04055eb21624', 'f24aa3d6-027f-43af-ac2b-69cdfbe61394', 'APPLICATION_STATUS_UPDATED', '::1', NULL, '{"applicantUserId":"be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf","oldStatus":"VERIFIKASI_BERKAS","newStatus":"DITOLAK","notes":"- Transkrip Nilai buram, terpotong, atau tidak terbaca dengan jelas.\\n- Surat Keterangan Aktif Kuliah / KTM tidak valid atau belum disahkan pejabat berwenang."}', 'b23cd593-9909-4462-8d15-e892f45dec82', '2026-10-19 04:11:31'),
('85f1d769-769b-4cce-a5a0-a406d55f0675', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'PROFILE_UPDATED', '::1', NULL, 'null', 'aa501b6f-3ffc-43a6-a27a-4a6c07ac571d', '2026-10-19 04:42:43'),
('8e596808-f5be-46bb-b24d-fe02c41c0a0d', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'REFRESH_TOKEN_REUSE_DETECTED', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'null', 'bccd8290-c088-4192-b3c2-d82f922e48cf', '2026-10-19 04:27:40'),
('955d7c23-e486-47de-b509-0da3238fc7de', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'FILE_UPLOADED', '::1', NULL, '{"docType":"transkrip","originalName":"INTECHREST KE PT BOSOWA.pdf","storedName":"a529a683-ff9d-4192-bd9a-9a55f1746a6b.pdf","mimeType":"application/pdf","size":750563,"isAppealState":false}', '8ff25d60-4282-4acc-9bb5-afecdb82c4ba', '2026-10-19 04:08:54'),
('960d3296-dd51-4edb-9e1b-16fe5d83ffbd', '77a40f29-0e6e-4d3e-a36e-7f07919fe410', 'PROFILE_UPDATED', '127.0.0.1', NULL, 'null', 'test', '2026-10-04 18:13:40'),
('9eb5ab5c-fe9b-401e-8daf-dfbed17c3c46', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'FILE_UPLOADED', '::1', NULL, '{"docType":"esai","originalName":"Intechrest Logo.png","storedName":"61823853-e254-49ed-922e-094e267698db.png","mimeType":"image/png","size":19936,"isAppealState":false}', '9d274b3c-8df8-4c34-b098-ee0b7fa5269b', '2026-10-19 04:09:10'),
('a15357d3-ba95-4902-8679-9ef6607f52fd', '77a40f29-0e6e-4d3e-a36e-7f07919fe410', 'EDUCATION_UPDATED', '127.0.0.1', NULL, '{"count":4}', 'test', '2026-10-04 18:13:40'),
('af85dd95-1d10-494c-91e7-918008abeac6', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'FILE_UPLOADED', '::1', NULL, '{"docType":"ktm","originalName":"LAMPIRAN_1_LOG_BOOK_ALQAF.pdf","storedName":"f8e50858-7e38-440d-9048-8667a082b8b3.pdf","mimeType":"application/pdf","size":139721,"isAppealState":false}', '3343cc3a-d961-4f3b-8036-9427079515b7', '2026-10-19 04:09:02'),
('afa74db0-590d-4768-b2ed-6887ef94b007', 'f24aa3d6-027f-43af-ac2b-69cdfbe61394', 'LOGIN_SUCCESS', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'null', '52c658ad-e58d-4a15-825a-f7acc104b4ef', '2026-10-19 04:09:22'),
('b15b2be0-ca26-468f-981f-56dbf0df04a2', 'a32daad7-a8cd-49ac-bcb7-8aa674f62930', 'PROFILE_UPDATED', '127.0.0.1', NULL, 'null', 'test', '2026-10-04 18:13:40'),
('ba0710ce-0e4f-4c27-9baa-81f507fcdcb3', 'b72e0393-1913-4b1f-8352-9d4e376c6227', 'PROFILE_UPDATED', '127.0.0.1', NULL, 'null', 'test', '2026-10-04 18:13:40'),
('bd28edd3-acf1-4c80-90d7-81135ad92800', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'EDUCATION_UPDATED', '::1', NULL, '{"count":1}', '306bc64e-9155-47fd-90c7-db41b0bae55d', '2026-10-19 04:07:54'),
('c6db4662-133e-4eca-87f1-2a250f9888d8', '73548a22-f581-4f86-97db-4430a23c5278', 'PROFILE_UPDATED', '::1', NULL, 'null', '4ec47fae-175e-4223-81ff-ef7f35ba1ca3', '2026-09-30 22:41:55'),
('c988112f-1a58-45b1-8c85-63013cfa3f9b', '73548a22-f581-4f86-97db-4430a23c5278', 'LOGIN_FAILED', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'null', '0fa313b3-438d-4ab4-b674-acd0315474be', '2026-10-19 04:00:47'),
('cb9faafc-7bfa-4fab-be07-081b88160692', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'REFRESH_TOKEN_REUSE_DETECTED', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'null', '0c020c3f-4d6f-4736-8b48-d81bc77d1282', '2026-10-19 04:27:40'),
('cda51813-0c3b-4994-bc0e-f7d3ce550145', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'REFRESH_TOKEN_REUSE_DETECTED', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'null', '4743e7b8-b241-4e14-b29b-48e8ddbdee99', '2026-10-19 04:27:40'),
('cda9a0d5-934f-40ff-93ba-2c08515d8389', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'LOGIN_SUCCESS', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'null', '578ea109-b040-458f-a96e-f1ec203ace04', '2026-10-19 04:36:15'),
('ce2c7de7-7aaa-47f4-9604-4f5746d0ad86', '77a40f29-0e6e-4d3e-a36e-7f07919fe410', 'PROFILE_UPDATED', '127.0.0.1', NULL, 'null', 'test', '2026-10-04 18:13:40'),
('d4323e99-54d1-4a7f-9bec-99a2ab20e46d', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'LOGIN_FAILED', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'null', '76b91163-e06f-4f91-becb-681fb9f8656f', '2026-10-19 16:22:35'),
('d8936468-f03d-42d6-a746-3d5b540915fc', '77a40f29-0e6e-4d3e-a36e-7f07919fe410', 'EDUCATION_UPDATED', '127.0.0.1', NULL, '{"count":4}', 'test', '2026-10-04 18:13:40'),
('d9339907-3d47-4a44-acaa-d9e064c9f392', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'FILE_UPLOADED', '::1', NULL, '{"docType":"ktp","originalName":"download.jpg","storedName":"49c2af0f-4f32-450a-884b-e1193d1e1786.jpg","mimeType":"image/jpeg","size":130028,"isAppealState":false}', 'a2390d29-3751-48fd-b1b1-bf36bc31cf9f', '2026-10-19 04:08:50'),
('dae4eb52-255d-4c26-b1f2-5987c1a5099f', 'a32daad7-a8cd-49ac-bcb7-8aa674f62930', 'EDUCATION_UPDATED', '127.0.0.1', NULL, '{"count":3}', 'test', '2026-10-04 18:13:40'),
('dcaa55fa-1150-423c-8649-06c3272c07ee', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'FILE_UPLOADED', '::1', NULL, '{"docType":"surat_permohonan","originalName":"download (1).jpg","storedName":"fa5056d1-c1f6-4072-aa73-272910cd74ce.jpg","mimeType":"image/jpeg","size":114690,"isAppealState":false}', '03291ec7-cb6b-4372-9b6b-d775eca3242b', '2026-10-19 04:08:46'),
('e38fd3e5-9df9-43bc-8f6e-33caa89c087c', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'EDUCATION_UPDATED', '::1', NULL, '{"count":2}', '259876a7-0500-424e-866b-38f498180006', '2026-10-19 04:09:16'),
('e4e5b87c-ba9e-4953-9c32-11d97eae56ff', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'PROFILE_UPDATED', '::1', NULL, 'null', 'ac9fa6bd-409c-456e-8fc6-7f5a1b5f6a64', '2026-10-19 04:07:54'),
('f2572097-a3db-47ee-a255-508446ccc224', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'FILE_UPLOADED', '::1', NULL, '{"docType":"dtks","originalName":"download (1).jpg","storedName":"2fd9e515-e599-4eb3-a44b-cbb9f0aeab42.jpg","mimeType":"image/jpeg","size":114690,"isAppealState":true}', '6683df77-6be6-4d85-8284-6ae37cf9a186', '2026-10-19 04:10:29'),
('f4be891e-1b3e-47d4-81d9-eba720fb8c5a', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'LOGIN_SUCCESS', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'null', 'efd511d8-9cdb-4aff-b189-9db9446fdc94', '2026-10-19 16:22:43'),
('f5cc43db-8ca8-4c9f-bdf1-f650f89de276', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'FILE_UPLOADED', '::1', NULL, '{"docType":"selfie","originalName":"selfie.webp","storedName":"47535992-7190-4c6e-90eb-c1ea931dc2ca.webp","mimeType":"image/webp","size":9548,"isAppealState":false}', 'e8c78819-fc60-4900-ac69-6e18e2a1f465', '2026-10-19 04:07:54');

--
-- Struktur tabel `documents`
--
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doc_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stored_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_documents_user_id` (`user_id`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data tabel `documents` (12 baris)
--
INSERT INTO `documents` (`id`, `user_id`, `doc_type`, `original_name`, `stored_name`, `mime_type`, `file_size`, `file_path`, `uploaded_at`) VALUES
('59a83be6-e31f-4165-995e-3ea26eb54388', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'esai', 'Intechrest Logo.png', '61823853-e254-49ed-922e-094e267698db.png', 'image/png', 19936, 'uploads\\esai\\61823853-e254-49ed-922e-094e267698db.png', '2026-10-19 04:09:10'),
('6870d2f5-20d1-41e0-95c0-dedc9a1a6c1c', '73548a22-f581-4f86-97db-4430a23c5278', 'ktm', 'PROJECT DEFINITION RAFFI.pdf', 'c0cbdcd0-7144-4022-944b-9811f06ac389.pdf', 'application/pdf', 146642, 'uploads\\ktm\\c0cbdcd0-7144-4022-944b-9811f06ac389.pdf', '2026-09-30 22:41:55'),
('6a152618-8d2a-4631-92f7-8309e3fb1e09', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'transkrip', 'INTECHREST KE PT BOSOWA.pdf', 'a529a683-ff9d-4192-bd9a-9a55f1746a6b.pdf', 'application/pdf', 750563, 'uploads\\transkrip\\a529a683-ff9d-4192-bd9a-9a55f1746a6b.pdf', '2026-10-19 04:08:54'),
('73faa8d7-4b24-4c0e-a8f4-a5029647e790', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'surat_permohonan', 'download (1).jpg', 'fa5056d1-c1f6-4072-aa73-272910cd74ce.jpg', 'image/jpeg', 114690, 'uploads\\surat_permohonan\\fa5056d1-c1f6-4072-aa73-272910cd74ce.jpg', '2026-10-19 04:08:46'),
('984e5c44-a624-41a6-8d75-2842742c7932', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'ktp', 'download.jpg', '49c2af0f-4f32-450a-884b-e1193d1e1786.jpg', 'image/jpeg', 130028, 'uploads\\ktp\\49c2af0f-4f32-450a-884b-e1193d1e1786.jpg', '2026-10-19 04:08:50'),
('9dc886a3-b660-417e-b78d-8f57cd9cbc65', '73548a22-f581-4f86-97db-4430a23c5278', 'selfie', 'selfie.webp', '2995ecd6-536c-4c61-8bb7-0e9e52ee7fe0.webp', 'image/webp', 8746, 'uploads\\selfies\\2995ecd6-536c-4c61-8bb7-0e9e52ee7fe0.webp', '2026-09-30 22:41:55'),
('af540cb3-55ff-487c-919f-971c1f31312f', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'ktm', 'LAMPIRAN_1_LOG_BOOK_ALQAF.pdf', 'f8e50858-7e38-440d-9048-8667a082b8b3.pdf', 'application/pdf', 139721, 'uploads\\ktm\\f8e50858-7e38-440d-9048-8667a082b8b3.pdf', '2026-10-19 04:09:02'),
('c6b3c055-0732-43b5-9363-d54851e4bdf4', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'dtks', 'INTECHREST KE PT BOSOWA.pdf', '2f9a0065-327e-4d10-9399-9c0ad66f6366.pdf', 'application/pdf', 750563, 'uploads\\dtks\\2f9a0065-327e-4d10-9399-9c0ad66f6366.pdf', '2026-10-19 04:09:05'),
('cc17a76b-cea6-42ab-b153-1555f4af4fac', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'ktp', 'download.jpg', 'da90b77f-8c7a-4d28-aab2-920140a0efd0.jpg', 'image/jpeg', 130028, 'uploads\\ktp\\da90b77f-8c7a-4d28-aab2-920140a0efd0.jpg', '2026-10-19 04:10:22'),
('d621aff3-52f3-4acb-aa84-e897a93cb697', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'surat_pernyataan', 'LAMPIRAN LOGBOOK AGUSTUS.pdf', '511e1ed5-3af1-437b-b6aa-cef22be616a0.pdf', 'application/pdf', 142987, 'uploads\\surat_pernyataan\\511e1ed5-3af1-437b-b6aa-cef22be616a0.pdf', '2026-10-19 04:08:58'),
('f12c139f-408d-4c04-8d0c-02c4003ebc6d', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'dtks', 'download (1).jpg', '2fd9e515-e599-4eb3-a44b-cbb9f0aeab42.jpg', 'image/jpeg', 114690, 'uploads\\dtks\\2fd9e515-e599-4eb3-a44b-cbb9f0aeab42.jpg', '2026-10-19 04:10:29'),
('f9a25359-9d5a-4f5f-9ffc-741b1e4b6d4b', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'selfie', 'selfie.webp', '47535992-7190-4c6e-90eb-c1ea931dc2ca.webp', 'image/webp', 9548, 'uploads\\selfies\\47535992-7190-4c6e-90eb-c1ea931dc2ca.webp', '2026-10-19 04:07:54');

--
-- Struktur tabel `education_history`
--
DROP TABLE IF EXISTS `education_history`;
CREATE TABLE `education_history` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tingkat` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institusi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jurusan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tahun_mulai` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tahun_lulus` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_education_user_id` (`user_id`),
  CONSTRAINT `education_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data tabel `education_history` (3 baris)
--
INSERT INTO `education_history` (`id`, `user_id`, `tingkat`, `institusi`, `jurusan`, `tahun_mulai`, `tahun_lulus`, `sort_order`) VALUES
('16d90671-921e-4882-880a-df135b0284e7', '73548a22-f581-4f86-97db-4430a23c5278', 'SMA', 'testi', 'testi', '2022', '2023', 0),
('23284cf7-da27-4c4a-b4c4-0cdc4b486058', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'SMA', 'testing', 'testing', '2020', '2021', 0),
('b7a0000c-9335-4530-a40b-4574db6cf531', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'S1', 'testing', 'Pendidikan Teknik Mesin', NULL, NULL, 1);

--
-- Struktur tabel `profiles`
--
DROP TABLE IF EXISTS `profiles`;
CREATE TABLE `profiles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tempat_lahir` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `gender` enum('Laki-laki','Perempuan') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_hp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_pernikahan` enum('Belum Menikah','Menikah') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alamat_domisili` longtext COLLATE utf8mb4_unicode_ci,
  `selfie_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `no_kk` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alamat_ktp` longtext COLLATE utf8mb4_unicode_ci,
  `akreditasi_prodi` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nim` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `semester` int DEFAULT NULL,
  `ipk` decimal(4,2) DEFAULT NULL,
  `target_lulus` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `beasiswa_lain` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_ayah` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pekerjaan_ayah` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_ibu` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pekerjaan_ibu` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `penghasilan_ortu` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jumlah_tanggungan` int DEFAULT NULL,
  `kepemilikan_bantuan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prestasi_akademik` longtext COLLATE utf8mb4_unicode_ci,
  `prestasi_non_akademik` longtext COLLATE utf8mb4_unicode_ci,
  `pengalaman_organisasi` longtext COLLATE utf8mb4_unicode_ci,
  `pengalaman_pengabdian` longtext COLLATE utf8mb4_unicode_ci,
  `pelatihan_sertifikasi` longtext COLLATE utf8mb4_unicode_ci,
  `prodi_prioritas` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signature_data` longtext COLLATE utf8mb4_unicode_ci,
  `nama_bank` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_rekening` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_rekening` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `perguruan_tinggi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fakultas_prodi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `asal_daerah` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_profiles_user_id` (`user_id`),
  CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data tabel `profiles` (3 baris)
--
INSERT INTO `profiles` (`id`, `user_id`, `tempat_lahir`, `tanggal_lahir`, `gender`, `no_hp`, `status_pernikahan`, `alamat_domisili`, `selfie_path`, `created_at`, `updated_at`, `no_kk`, `alamat_ktp`, `akreditasi_prodi`, `nim`, `semester`, `ipk`, `target_lulus`, `beasiswa_lain`, `nama_ayah`, `pekerjaan_ayah`, `nama_ibu`, `pekerjaan_ibu`, `penghasilan_ortu`, `jumlah_tanggungan`, `kepemilikan_bantuan`, `prestasi_akademik`, `prestasi_non_akademik`, `pengalaman_organisasi`, `pengalaman_pengabdian`, `pelatihan_sertifikasi`, `prodi_prioritas`, `signature_data`, `nama_bank`, `no_rekening`, `nama_rekening`, `perguruan_tinggi`, `fakultas_prodi`, `asal_daerah`) VALUES
('4dee6daa-da6a-49b6-b50c-cba0ba777443', 'f24aa3d6-027f-43af-ac2b-69cdfbe61394', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-21 17:59:10', '2026-09-21 17:59:10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('50383d7c-37fc-4ab2-b733-bd007796e21b', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'testing', '2002-10-06 07:00:00', 'Laki-laki', '+62 82332468425', 'Belum Menikah', 'testing', 'uploads\\selfies\\47535992-7190-4c6e-90eb-c1ea931dc2ca.webp', '2026-10-19 04:07:54', '2026-10-19 04:42:43', '8324435678768756', 'testing', 'Baik Sekali', '3421232', 3, 3.66, '2023', 'Tidak Ada (Bukan Double Funding)', 'testing', 'testing', 'testing', 'testing', '< Rp 1.500.000', 3, 'Tidak Ada', NULL, NULL, NULL, NULL, NULL, 'Pendidikan Teknik Mesin', 'data:image/png;base64,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', 'SeaBank', '43213124111312', 'Testing', 'testing', 'Pendidikan Teknik Mesin', 'KONAWE_SELATAN'),
('ee3facb3-d554-4825-9058-98ad10850322', '73548a22-f581-4f86-97db-4430a23c5278', 'test', '2026-09-30 07:00:00', 'Laki-laki', '+62 831231', 'Belum Menikah', 'test', 'uploads\\selfies\\2995ecd6-536c-4c61-8bb7-0e9e52ee7fe0.webp', '2026-09-30 22:41:20', '2026-09-30 22:41:55', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Tidak Ada (Bukan Double Funding)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Teknik Kelautan', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

--
-- Struktur tabel `refresh_tokens`
--
DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_refresh_tokens_hash` (`token_hash`),
  KEY `idx_refresh_tokens_user_id` (`user_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data tabel `refresh_tokens` (3 baris)
--
INSERT INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `created_at`, `revoked`) VALUES
('073d4551-94a8-4727-a879-821b2835bcc1', 'f24aa3d6-027f-43af-ac2b-69cdfbe61394', '863ee12f498b38251a877ad1817549963489e3957f18b732fbdaa23df833bf5e', '2026-10-25 21:42:52', '2026-10-19 04:42:52', 0),
('be7e8dce-4bf4-4134-9c3a-7d50650aab33', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'c1795e5eb824b26fe050544cc0287c10df7b2bd8c120e0b7b8d45280c3802fc9', '2026-10-26 09:22:43', '2026-10-19 16:22:43', 0),
('dec81d66-05c3-4f85-9194-506584beb57f', 'be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'fe2c2b0a62e5d104e718a806b05b176d0f466b3b41f3ff31bca440ad096b66fa', '2026-10-25 21:36:15', '2026-10-19 04:36:15', 1);

--
-- Struktur tabel `token_blacklist`
--
DROP TABLE IF EXISTS `token_blacklist`;
CREATE TABLE `token_blacklist` (
  `token_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`token_hash`),
  KEY `idx_token_blacklist_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Struktur tabel `users`
--
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nik` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('mahasiswa','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'mahasiswa',
  `nama_lengkap` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jenjang_target` enum('S1','S2','S3') COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_login_attempts` int NOT NULL DEFAULT '0',
  `locked_until` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  UNIQUE KEY `idx_users_nik` (`nik`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data tabel `users` (3 baris)
--
INSERT INTO `users` (`id`, `email`, `nik`, `password_hash`, `role`, `nama_lengkap`, `jenjang_target`, `failed_login_attempts`, `locked_until`, `created_at`, `updated_at`) VALUES
('73548a22-f581-4f86-97db-4430a23c5278', 'test1@gmail.com', '7332134325452756', '$2b$12$yhAcZ01UREDBRqYtG1PFEepfrlOjbucWtoPceyNo2OmGnKspthDl6', 'mahasiswa', 'testing', 'S1', 3, NULL, '2026-09-30 22:41:20', '2026-10-19 04:00:52'),
('be82c5f6-14d9-4a9a-a8c0-fb0ca7f4f0cf', 'test@gmail.com', '3402532685134924', '$2b$12$cAEq5CvRjbbUW.2cGqIMBO6GXosTLUkIBl2s1zfQQec6u0JGjPz22', 'mahasiswa', 'testing cuy', 'S1', 0, NULL, '2026-10-19 04:07:54', '2026-10-19 16:22:43'),
('f24aa3d6-027f-43af-ac2b-69cdfbe61394', 'admin@beasiswa-sultra.go.id', '9999999999999999', '$2b$12$xTXf6doSWvX4LpMUJDpcQe2bPx3o6XvZPr4UsIcSqLH6vG0ZCdSvK', 'admin', 'Admin BSSC', 'S1', 0, NULL, '2026-09-21 17:59:10', '2026-09-21 17:59:10');

SET FOREIGN_KEY_CHECKS = 1;
-- End of dump

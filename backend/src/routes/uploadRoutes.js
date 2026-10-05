import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do Multer para armazenamento no disco
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E6)}`;
    cb(null, `img-${uniqueSuffix}-${cleanName}${ext}`);
  }
});

// Filtro para garantir apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype;

  if (allowedTypes.test(ext) || mime.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo não suportado. Envie apenas imagens (JPG, PNG, WEBP).'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Até 10MB
  fileFilter: fileFilter
});

const router = Router();

// Upload genérico de uma foto
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo de imagem foi enviado.' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Foto carregada e armazenada com sucesso no backend!',
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Erro no upload de foto:', error);
    res.status(500).json({ error: 'Erro ao processar e salvar a imagem no servidor' });
  }
});

// Upload com múltiplos campos (avatar e capa)
router.post(
  '/registration-photos',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  (req, res) => {
    try {
      const hostUrl = `${req.protocol}://${req.get('host')}`;
      const result = {};

      if (req.files?.avatar?.[0]) {
        result.avatarUrl = `${hostUrl}/uploads/${req.files.avatar[0].filename}`;
      }

      if (req.files?.coverImage?.[0]) {
        result.coverImageUrl = `${hostUrl}/uploads/${req.files.coverImage[0].filename}`;
      }

      res.json({
        success: true,
        message: 'Fotos de cadastro armazenadas com sucesso no backend!',
        ...result
      });
    } catch (error) {
      console.error('Erro no upload de fotos de cadastro:', error);
      res.status(500).json({ error: 'Erro ao salvar fotos de cadastro' });
    }
  }
);

export default router;

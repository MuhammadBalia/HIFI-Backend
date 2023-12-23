import Product from "../models/ProductModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";

export const getProducts = async (req, res) => {
  try {
    let response;
    if (req.role === "admin") {
      response = await Product.findAll({
        attributes: ["uuid", "name", "description", "price"],
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    } else {
      response = await Product.findAll({
        attributes: ["uuid", "name", "description", "price"],
        where: {
          userId: req.userId,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: "error.message" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!product) {
      return res.status(404).json({ msg: "Data Tidak Ditemukan" });
    }

    let response;

    if (req.role === "admin" && req.product && req.product.id) {
      response = await Product.findOne({
        attributes: ["uuid", "name", "description", "price"],
        where: {
          id: req.product.id,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    } else {
      response = await Product.findOne({
        attributes: ["uuid", "name", "description", "price"],
        where: {
          [Op.and]: [{ id: product.id }, { userId: req.userId }],
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createProducts = async (req, res) => {
  const { name, description, price } = req.body;
  
  try {
    // Dapatkan file foto dari request
    const photoFile = req.files ? req.files.photo : null;
    
    // Jika ada file foto, simpan ke folder public/images
    let photoFileName = null;
    if (photoFile) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      photoFileName = `photo-${uniqueSuffix}.${photoFile.name.split('.').pop()}`;
      await photoFile.mv(`public/images/${photoFileName}`);
    }

    // Buat produk baru dengan menyertakan nama file foto jika ada
    const newProduct = await Product.create({
      name: name,
      description: description,
      price: price,
      userId: req.userId,
      photo: photoFileName, // Simpan nama file foto ke dalam database
    });

    res.status(201).json({ msg: "Product Created Successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const updateProducts = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!product) {
      return res.status(404).json({ msg: "Data Tidak Ditemukan" });
    }

    const { name, description, price } = req.body;

    if (req.role === "admin") {
      await Product.update(
        { name, description, price },
        {
          where: {
            id: product.id,
          },
        }
      );
    } else {
      if (req.userId !== product.userId)
        return res.status(403).json({ msg: "Akses Terlarang" });
      await Product.update(
        { name, description, price },
        {
          where: {
            [Op.and]: [{ id: product.id }, { userId: req.userId }],
          },
        }
      );
    }

    res.status(200).json({msg: "Product Updated Successfuly"});
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteProducts = async(req, res) => {
    try {
        const product = await Product.findOne({
          where: {
            uuid: req.params.id,
          },
        });
    
        if (!product) {
          return res.status(404).json({ msg: "Data Tidak Ditemukan" });
        }
    
        const { name, description, price } = req.body;
    
        if (req.role === "admin") {
          await Product.destroy(
            {
              where: {
                id: product.id,
              },
            }
          );
        } else {
          if (req.userId !== product.userId)
            return res.status(403).json({ msg: "Akses Terlarang" });
          await Product.destroy(
            {
              where: {
                [Op.and]: [{ id: product.id }, { userId: req.userId }],
              },
            }
          );
        }
    
        res.status(200).json({msg: "Product Deleted Successfuly"});
      } catch (error) {
        res.status(500).json({ msg: error.message });
      }
    };

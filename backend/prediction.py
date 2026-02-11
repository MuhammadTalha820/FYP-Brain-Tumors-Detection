import os
# Workaround for OpenMP duplicate runtime error (set before any OpenMP-using library is imported)
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models
import numpy as np
import matplotlib.pyplot as plt

###########################
# HELPER FUNCTIONS & CLASSES
###########################

def center_crop(tensor, target_size):
    """
    Center crop a tensor to the target spatial size.
    :param tensor: Tensor of shape (B, C, H, W)
    :param target_size: (target_height, target_width)
    :return: Center cropped tensor.
    """
    _, _, h, w = tensor.size()
    target_h, target_w = target_size
    start_h = (h - target_h) // 2
    start_w = (w - target_w) // 2
    return tensor[:, :, start_h:start_h + target_h, start_w:start_w + target_w]

def resize_tensor(img, size=(224, 224)):
    """
    Resize a tensor image using bilinear interpolation.
    :param img: Tensor of shape (C, H, W)
    :param size: desired output size (H, W)
    :return: Resized tensor of shape (C, size[0], size[1])
    """
    return F.interpolate(img.unsqueeze(0), size=size, mode='bilinear', align_corners=False).squeeze(0)

def apply_color_map(mask):
    """
    Apply color mapping to a segmentation mask.
    Mapping: 0: Black, 1: Blue, 2: Green, 3: Red.
    :param mask: numpy array of shape (H, W) with integer class labels.
    :return: PIL Image with the colored mask.
    """
    color_map = {
        0: [0, 0, 0],       # Background - Black
        1: [0, 0, 255],     # Edema (Blue)
        2: [0, 255, 0],     # Necrosis (Green)
        3: [255, 0, 0]      # Enhancing Tumor (Red)
    }
    h, w = mask.shape
    color_mask = np.zeros((h, w, 3), dtype=np.uint8)
    for cls, color in color_map.items():
        color_mask[mask == cls] = color
    return Image.fromarray(color_mask)

def plot_metrics(metrics_dict, title="Metrics"):
    """
    Plot metrics as a bar chart with improved spacing.
    :param metrics_dict: Dictionary with metric names and percentage values.
    """
    labels = list(metrics_dict.keys())
    values = list(metrics_dict.values())
    plt.figure(figsize=(8,6))
    bars = plt.bar(labels, values, width=0.5)
    plt.ylim(0, 100)
    plt.title(title, pad=20)
    plt.ylabel("Confidence / Accuracy (%)")
    plt.xticks(rotation=45, ha='right', fontsize=10)
    for i, v in enumerate(values):
        plt.text(i, v + 2, f"{v:.2f}%", ha='center', fontsize=10)
    plt.tight_layout()
    plt.show()

###########################
# UNet Model Definition
###########################
class UNet(nn.Module):
    def __init__(self, in_channels=4, out_channels=4, dropout_prob=0.2):
        super(UNet, self).__init__()
        # Encoder
        self.enc1 = self.double_conv(in_channels, 32)
        self.pool1 = nn.MaxPool2d(2)
        self.enc2 = self.double_conv(32, 64)
        self.pool2 = nn.MaxPool2d(2)
        self.enc3 = self.double_conv(64, 128)
        self.pool3 = nn.MaxPool2d(2)
        self.enc4 = self.double_conv(128, 256)
        self.pool4 = nn.MaxPool2d(2)
        self.bottleneck = self.double_conv(256, 512)
        self.dropout = nn.Dropout(dropout_prob)
        # Decoder
        self.up1 = nn.Upsample(scale_factor=2, mode='nearest')
        self.conv_up1 = nn.Conv2d(512, 256, kernel_size=2)
        self.dec1 = self.double_conv(256 + 256, 256)
        self.up2 = nn.Upsample(scale_factor=2, mode='nearest')
        self.conv_up2 = nn.Conv2d(256, 128, kernel_size=2)
        self.dec2 = self.double_conv(128 + 128, 128)
        self.up3 = nn.Upsample(scale_factor=2, mode='nearest')
        self.conv_up3 = nn.Conv2d(128, 64, kernel_size=2)
        self.dec3 = self.double_conv(64 + 64, 64)
        self.up4 = nn.Upsample(scale_factor=2, mode='nearest')
        self.conv_up4 = nn.Conv2d(64, 32, kernel_size=2)
        self.dec4 = self.double_conv(32 + 32, 32)
        self.final_conv = nn.Conv2d(32, out_channels, kernel_size=1)
    def double_conv(self, in_channels, out_channels):
        return nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1),
            nn.ReLU(inplace=True)
        )
    def forward(self, x):
        conv1 = self.enc1(x)
        pool1 = self.pool1(conv1)
        conv2 = self.enc2(pool1)
        pool2 = self.pool2(conv2)
        conv3 = self.enc3(pool2)
        pool3 = self.pool3(conv3)
        conv4 = self.enc4(pool3)
        pool4 = self.pool4(conv4)
        bottleneck = self.bottleneck(pool4)
        bottleneck = self.dropout(bottleneck)
        up1 = self.up1(bottleneck)
        up1 = self.conv_up1(up1)
        if conv4.size()[2:] != up1.size()[2:]:
            conv4 = center_crop(conv4, up1.size()[2:])
        dec1 = self.dec1(torch.cat([conv4, up1], dim=1))
        up2 = self.up2(dec1)
        up2 = self.conv_up2(up2)
        if conv3.size()[2:] != up2.size()[2:]:
            conv3 = center_crop(conv3, up2.size()[2:])
        dec2 = self.dec2(torch.cat([conv3, up2], dim=1))
        up3 = self.up3(dec2)
        up3 = self.conv_up3(up3)
        if conv2.size()[2:] != up3.size()[2:]:
            conv2 = center_crop(conv2, up3.size()[2:])
        dec3 = self.dec3(torch.cat([conv2, up3], dim=1))
        up4 = self.up4(dec3)
        up4 = self.conv_up4(up4)
        if conv1.size()[2:] != up4.size()[2:]:
            conv1 = center_crop(conv1, up4.size()[2:])
        dec4 = self.dec4(torch.cat([conv1, up4], dim=1))
        return self.final_conv(dec4)

###########################
# GUI CLASS
###########################
class PredictionGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Federated Model Prediction")
        self.root.geometry("1000x800")

        # Background image path
        self.bg_path = "./ab.jpg"
        # Label for background
        self.bg_label = tk.Label(self.root)
        self.bg_label.place(x=0, y=0, relwidth=1, relheight=1)
        # Initial background setup
        self._update_background(1000, 800)
        # Bind resize event to update background
        self.root.bind("<Configure>", self._on_resize)

        # Device setup
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        # Models and data placeholders
        self.classification_model = None
        self.segmentation_model = None
        self.loaded_image = None

        # GUI elements
        title_lbl = tk.Label(root, text="Federated Model Prediction", font=("Helvetica", 20, "bold"), bg="#ffffff")
        title_lbl.pack(pady=10)
        frame_buttons = tk.Frame(root, bg="#ffffff")
        frame_buttons.pack(pady=5)

        btn_load_class_model = tk.Button(frame_buttons, text="Load Classification Model (.pth)", command=self.load_classification_model, width=30, bg="#0073e6", fg="white")
        btn_load_class_model.grid(row=0, column=0, padx=5, pady=5)
        btn_load_seg_model = tk.Button(frame_buttons, text="Load Segmentation Model (.pth)", command=self.load_segmentation_model, width=30, bg="#0073e6", fg="white")
        btn_load_seg_model.grid(row=0, column=1, padx=5, pady=5)
        btn_load_image = tk.Button(frame_buttons, text="Load Image (for classification & segmentation)", width=40, command=self.load_image, bg="#0059b3", fg="white")
        btn_load_image.grid(row=1, column=0, columnspan=2, padx=5, pady=5)
        btn_predict = tk.Button(frame_buttons, text="Predict", command=self.predict, width=30, bg="#003366", fg="white")
        btn_predict.grid(row=2, column=0, columnspan=2, padx=5, pady=10)

        self.log_text = tk.Text(root, height=10, width=100, font=("Helvetica", 10))
        self.log_text.pack(pady=10)
        self.log("Logs will appear here...")

        self.img_label = tk.Label(root)
        self.img_label.pack(pady=5)

    def _update_background(self, width, height):
        """Load, resize, and apply the background image."""
        try:
            img = Image.open(self.bg_path)
            img = img.resize((width, height), Image.Resampling.LANCZOS)
            self.bg_image = ImageTk.PhotoImage(img)
            self.bg_label.config(image=self.bg_image)
            self.bg_label.lower()
        except Exception as e:
            print(f"Error loading background image: {e}")

    def _on_resize(self, event):
        """Re-apply background when window resizes."""
        if event.widget == self.root:
            self._update_background(event.width, event.height)

    def log(self, message):
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)
    
    def load_classification_model(self):
        path = filedialog.askopenfilename(title="Select Classification Model (.pth)",
                                          filetypes=[("PyTorch Model", "*.pth")])
        if path and os.path.isfile(path):
            try:
                self.classification_model = models.mobilenet_v2(pretrained=False)
                in_features = self.classification_model.classifier[1].in_features
                self.classification_model.classifier[1] = nn.Linear(in_features, 2)
                state_dict = torch.load(path, map_location=self.device)
                self.classification_model.load_state_dict(state_dict)
                self.classification_model.to(self.device)
                self.classification_model.eval()
                self.log(f"Classification model loaded successfully from {path}")
                messagebox.showinfo("Success", "Classification model loaded successfully.")
            except Exception as e:
                self.log(f"Error loading classification model: {e}")
                messagebox.showerror("Error", f"Error loading classification model:\n{e}")
        else:
            self.log("Invalid classification model file selected.")
            messagebox.showerror("Error", "Invalid file for classification model.")
    
    def load_segmentation_model(self):
        path = filedialog.askopenfilename(title="Select Segmentation Model (.pth)",
                                          filetypes=[("PyTorch Model", "*.pth")])
        if path and os.path.isfile(path):
            try:
                self.segmentation_model = UNet(in_channels=4, out_channels=4, dropout_prob=0.2)
                state_dict = torch.load(path, map_location=self.device)
                self.segmentation_model.load_state_dict(state_dict)
                self.segmentation_model.to(self.device)
                self.segmentation_model.eval()
                self.log(f"Segmentation model loaded successfully from {path}")
                messagebox.showinfo("Success", "Segmentation model loaded successfully.")
            except Exception as e:
                self.log(f"Error loading segmentation model: {e}")
                messagebox.showerror("Error", f"Error loading segmentation model:\n{e}")
        else:
            self.log("Invalid segmentation model file selected.")
            messagebox.showerror("Error", "Invalid file for segmentation model.")
    
    def load_image(self):
        path = filedialog.askopenfilename(title="Select Image",
                                          filetypes=[("Image Files", "*.jpg *.jpeg *.png *.tif *.tiff"), ("All Files", "*.*")])
        if path and os.path.isfile(path):
            try:
                self.loaded_image = Image.open(path).convert("RGB")
                disp_img = self.loaded_image.resize((300, 300))
                photo = ImageTk.PhotoImage(disp_img)
                self.img_label.config(image=photo)
                self.img_label.image = photo
                self.log(f"Image loaded successfully from {path}")
            except Exception as e:
                self.log(f"Error loading image: {e}")
                messagebox.showerror("Error", f"Error loading image:\n{e}")
        else:
            self.log("Invalid image file selected.")
            messagebox.showerror("Error", "Invalid image file.")
    
    def image_to_segmentation_tensor(self):
        """
        Convert the loaded image into a 4-channel tensor for segmentation.
        The image is converted to grayscale, resized to (224,224),
        and replicated across 4 channels.
        """
        img_gray = self.loaded_image.convert("L")
        img_tensor = transforms.ToTensor()(img_gray)
        img_tensor = F.interpolate(img_tensor.unsqueeze(0), size=(224, 224), mode='bilinear', align_corners=False).squeeze(0)
        seg_input = img_tensor.repeat(4, 1, 1).unsqueeze(0)
        return seg_input

    def predict(self):
        if self.classification_model is None:
            messagebox.showerror("Error", "Please load the classification model first!")
            self.log("ERROR: Classification model not loaded.")
            return
        if self.segmentation_model is None:
            messagebox.showerror("Error", "Please load the segmentation model first!")
            self.log("ERROR: Segmentation model not loaded.")
            return
        if self.loaded_image is None:
            messagebox.showerror("Error", "Please load an image first!")
            self.log("ERROR: No image loaded for prediction.")
            return
        
        metrics = {}  # Dictionary to store confidence/accuracy metrics
        
        # -----------------------------
        # Classification Prediction
        # -----------------------------
        self.log("Starting classification prediction...")
        cls_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225])
        ])
        cls_input = cls_transform(self.loaded_image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            cls_output = self.classification_model(cls_input)
            _, cls_pred = torch.max(cls_output, 1)
            cls_probs = torch.softmax(cls_output, dim=1)
        cls_confidence = cls_probs[0, cls_pred.item()].item() * 100.0
        
        # Use the classification output to decide the result
        cls_result = "yes" if cls_pred.item() == 1 else "no"
        
        # Prepare messages and log details based on result
        if cls_result == "yes":
            self.log("Tumor detected! Patient is predicted as AFFECTED.")
            msg = (f"Unfortunately, this patient is predicted as YES.\n"
                   f"Accuracy: {cls_confidence:.2f}%\nPrecision: {cls_confidence:.2f}%")
        else:
            self.log("No tumor detected. Patient is predicted as NOT affected.")
            msg = (f"Good news! The patient is predicted as NO.\n"
                   f"Accuracy: {cls_confidence:.2f}%\nPrecision: {cls_confidence:.2f}%")
        
        # Display classification result
        messagebox.showinfo("Classification Result", msg)
        metrics["Classification Accuracy"] = cls_confidence
        metrics["Classification Precision"] = cls_confidence
        
        # -----------------------------
        # Segmentation Prediction (if tumor detected)
        # -----------------------------
        if cls_result == "yes":
            self.log("Proceeding with segmentation prediction since tumor was detected...")
            # Segmentation preprocessing: convert image to grayscale, resize and replicate to 4 channels.
            seg_transform = transforms.Compose([
                transforms.Grayscale(num_output_channels=1),
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
            ])
            img_seg = seg_transform(self.loaded_image)
            img_seg = img_seg * 255.0
            img_seg = img_seg.repeat(4, 1, 1).unsqueeze(0)  # shape: (1, 4, 224, 224)
            
            with torch.no_grad():
                seg_output = self.segmentation_model(img_seg.to(self.device))
                if seg_output.shape[2:] != (224, 224):
                    seg_output = F.interpolate(seg_output, size=(224, 224), mode='bilinear', align_corners=False)
                seg_prob = torch.softmax(seg_output, dim=1)
                # Use argmax to obtain predicted labels.
                seg_mask = torch.argmax(seg_prob, dim=1)  # shape: (1, 224, 224)
            seg_mask_np = seg_mask.squeeze(0).cpu().numpy().astype(np.uint8)
            
            self.log("Segmentation prediction completed successfully.")
            colored_mask = apply_color_map(seg_mask_np)
            
            # Compute pixel counts for each class
            counts = {}
            for cls in range(4):
                counts[cls] = int(np.sum(seg_mask_np == cls))
            
            self.show_segmentation_result(colored_mask, counts)
        else:
            self.log("Segmentation skipped since no tumor was detected.")
            messagebox.showinfo("Prediction", "Classification predicted: no tumor detected.")
        
        # -----------------------------
        # Display Metrics Graph (only classification metrics)
        # -----------------------------
        self.log(f"Final metrics: {metrics}")
        plot_metrics(metrics, title="Prediction Metrics")
    
    def show_segmentation_result(self, mask_img, counts):
        """
        Display the segmentation mask in a new window along with pixel counts for each class.
        """
        seg_win = tk.Toplevel(self.root)
        seg_win.title("Segmentation Result")
        seg_win.geometry("400x500")
        lbl = tk.Label(seg_win, text="Segmentation Mask", font=("Helvetica", 16, "bold"))
        lbl.pack(pady=10)
        disp_mask = mask_img.resize((350, 350))
        photo_mask = ImageTk.PhotoImage(disp_mask)
        mask_label = tk.Label(seg_win, image=photo_mask)
        mask_label.image = photo_mask  # Keep a reference
        mask_label.pack(pady=10)
        
        class_names = {
            0: "Background (Black)",
            1: "Edema (Blue)",
            2: "Necrosis (Green)",
            3: "Enhancing Tumor (Red)"
        }
        counts_text = ""
        for cls in range(4):
            counts_text += f"{class_names.get(cls, 'Class '+str(cls))}: {counts.get(cls, 0)} pixels\n"
        
        counts_label = tk.Label(seg_win, text=counts_text, font=("Helvetica", 12))
        counts_label.pack(pady=5)
        self.log("Segmentation result window displayed successfully.")

###########################
# MAIN EXECUTION
###########################
if __name__ == "__main__":
    root = tk.Tk()
    app = PredictionGUI(root)
    root.mainloop()

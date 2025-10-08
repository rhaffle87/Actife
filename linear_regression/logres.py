import numpy as np
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import plotly.graph_objects as go
from ipywidgets import interact, IntSlider, FloatSlider

def interactive_logistic(n_samples=100, noise=0.2):
    # 1. Generate toy 2-feature classification data
    X, y = make_classification(
        n_samples=n_samples,
        n_features=2,
        n_informative=2,
        n_redundant=0,
        n_clusters_per_class=1,
        flip_y=noise,
        class_sep=1.5,
        random_state=0
    )

    # 2. Fit logistic regression
    clf = LogisticRegression()
    clf.fit(X, y)
    y_pred = clf.predict(X)
    acc = accuracy_score(y, y_pred)

    # 3. Create decision boundary grid
    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 200),
                         np.linspace(y_min, y_max, 200))
    Z = clf.predict_proba(np.c_[xx.ravel(), yy.ravel()])[:, 1]
    Z = Z.reshape(xx.shape)

    # 4. Plotly figure
    fig = go.Figure()

    # Decision boundary heatmap
    fig.add_trace(go.Contour(
        x=np.linspace(x_min, x_max, 200),
        y=np.linspace(y_min, y_max, 200),
        z=Z,
        colorscale="RdBu",
        showscale=False,
        contours=dict(showlines=False)
    ))

    # Data points
    fig.add_trace(go.Scatter(
        x=X[y==0,0], y=X[y==0,1],
        mode='markers', name='Class 0',
        marker=dict(color='blue', size=8)
    ))
    fig.add_trace(go.Scatter(
        x=X[y==1,0], y=X[y==1,1],
        mode='markers', name='Class 1',
        marker=dict(color='red', size=8)
    ))

    fig.update_layout(
        title=f"Logistic Regression Decision Boundary (Accuracy: {acc:.2f})",
        xaxis_title="Feature 1", yaxis_title="Feature 2",
        width=700, height=500
    )
    fig.show()

# 5. Add interactive sliders
interact(interactive_logistic,
         n_samples=IntSlider(min=50, max=500, step=50, value=200, description='Samples'),
         noise=FloatSlider(min=0.0, max=0.5, step=0.05, value=0.1, description='Noise')
        )

# %%
import pandas as pd
import seaborn as sns
# remove column limit
pd.set_option('display.max_columns', None)
# make sns width wider
sns.set(rc={'figure.figsize':(12, 8)})
import plotly.express as px
from os import path
# %%
file_dir = path.dirname(__file__)
public_dir = path.join(file_dir, '..', 'public','data')
companies = pd.read_feather(path.join(public_dir, 'companies.arrow'))
mills = pd.read_feather(path.join(public_dir, 'uml.arrow'))
# fill none in RSPO Type with "Not Certified"
mills['RSPO Type'] = mills['RSPO Type'].apply(lambda x: x if x != None else 'Not Certified')
# %%
# count of mills by "report_year" groued by "consumer_brand"
mill_count = companies.groupby(['report_year', 'consumer_brand']).size().reset_index(name='count')
# pivot to each row a consumer_brand and each column a report_year
mill_count = mill_count.pivot(index='consumer_brand', columns='report_year', values='count')
mill_count = mill_count.fillna(0)
# make a heatmap with numbers in cells using seaborn
sns.heatmap(mill_count, annot=True, fmt='g')
# %%
# join mills to companies
joined = companies.merge(mills, on='UML ID', how='left')
# deduplicate on consumer_brand and UML ID
# merge report_year into a list of values
# take the first value for all otehr columns
years = joined.groupby(['consumer_brand', 'UML ID']).agg({
    "report_year": lambda x: list(x),
}).reset_index()
joined = joined.drop(columns=['report_year'])
joined = joined.drop_duplicates(subset=['consumer_brand', 'UML ID'])
# join the years back to the deduplicated joined
joined = joined.merge(years, on=['consumer_brand', 'UML ID'], how='left')
# %%
# box plot risk_score_ccurent, risk_score_future, and risk_score_past 
# facet by RSPO Status
fig = px.box(mills, x='RSPO Type', y='risk_score_current', color='RSPO Type')
fig.show()
# %%
fig = px.box(mills, x='RSPO Type', y='risk_score_past', color='RSPO Type')
fig.show()
# %%
sns.boxplot(data=mills, x='RSPO Type', y='risk_score_future')
fig = px.box(mills, x='RSPO Type', y='risk_score_future', color='RSPO Type')
fig.show()

# %%
# average risk scores in joined by consumer_brand
ranked = joined.groupby('consumer_brand').agg({
    'risk_score_current': 'mean',
    'risk_score_past': 'mean',
    'risk_score_future': 'mean'
}).reset_index()
# heatmap of ranked
# consumer_brand column is label
# risk_score columns are values
sns.heatmap(ranked.set_index('consumer_brand'), annot=True, fmt='g')
# %%
#  get columns of joined with "treeloss_km" in title
treeloss_cols = [col for col in joined.columns if 'treeloss_km' in col and '20' in col and '2000' not in col]
brand_treeloss = joined.groupby('consumer_brand')[treeloss_cols].sum().reset_index()
# %%
# line chart 
fig = px.line(brand_treeloss.melt(id_vars='consumer_brand'), x='variable', y='value', color='consumer_brand')
fig.show()
# %%
# calculate percent of treeloss for each year as percent of treeloss_km_2000
for col in treeloss_cols:
    joined[f"{col}_pct"] = joined[col] / joined['treeloss_km_2000']

# %%
pct_cols = [f"{col}_pct" for col in treeloss_cols]
brand_treeloss_pct = joined.groupby('consumer_brand')[pct_cols].mean().reset_index()
# %%
fig = px.line(brand_treeloss_pct.melt(id_vars='consumer_brand'), x='variable', y='value', color='consumer_brand')
fig.show()
# %%
# treeloss_sum_proportion_of_forest as boxplot by RSPO Type
fig = px.box(mills, x='RSPO Type', y='treeloss_sum_proportion_of_forest', color='RSPO Type')
fig.show()
# %%
# joined where brand is Mars
mars = joined[joined['consumer_brand'] == 'Mars']

# %%
# mars group by RSPO type
mars.groupby(['RSPO Type','report_year']).size()
# %%
